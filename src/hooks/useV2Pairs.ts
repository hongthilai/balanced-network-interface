import { useEffect, useMemo, useState } from 'react';

import bnJs from 'bnJs';
import { Currency, CurrencyAmount } from 'types/balanced-sdk-core';
import { Pair } from 'types/balanced-v1-sdk';

export enum PairState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID,
}

export function useV2Pairs(currencies: [Currency | undefined, Currency | undefined][]): [PairState, Pair | null][] {
  const [reserves, setReserves] = useState<({ reserve0: string; reserve1: string } | number | undefined)[]>([]);

  const tokens = useMemo(() => {
    return currencies.map(([currencyA, currencyB]) => [currencyA?.wrapped, currencyB?.wrapped]);
  }, [currencies]);

  useEffect(() => {
    setReserves(Array(tokens.length).fill(PairState.LOADING));

    const fetchReserves = async () => {
      const result = await Promise.all(
        tokens.map(async ([tokenA, tokenB]) => {
          if (tokenA && tokenB && tokenA.chainId === tokenB.chainId && !tokenA.equals(tokenB)) {
            const poolId = await bnJs.Dex.getPoolId(tokenA.address, tokenB.address);
            const reserveA = await bnJs.Dex.getPoolTotal(poolId, tokenA.address);
            const reserveB = await bnJs.Dex.getPoolTotal(poolId, tokenB.address);
            return { reserve0: reserveA, reserve1: reserveB };
          } else return undefined;
        }),
      );

      setReserves(result);
    };
    fetchReserves();
  }, [tokens]);

  return useMemo(() => {
    return tokens.map((tokenArr, i) => {
      const result = reserves[i];
      const tokenA = tokenArr[0];
      const tokenB = tokenArr[1];

      if (result === PairState.LOADING) return [PairState.LOADING, null];
      if (!tokenA || !tokenB || tokenA.equals(tokenB)) return [PairState.INVALID, null];
      if (!result) return [PairState.NOT_EXISTS, null];

      if (typeof result === 'number') return [PairState.INVALID, null];
      const { reserve0, reserve1 } = result;
      const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA];
      return [
        PairState.EXISTS,
        new Pair(CurrencyAmount.fromRawAmount(token0, reserve0), CurrencyAmount.fromRawAmount(token1, reserve1)),
      ];
    });
  }, [reserves, tokens]);
}

export function useV2Pair(tokenA?: Currency, tokenB?: Currency): [PairState, Pair | null] {
  const inputs: [[Currency | undefined, Currency | undefined]] = useMemo(() => [[tokenA, tokenB]], [tokenA, tokenB]);
  return useV2Pairs(inputs)[0];
}