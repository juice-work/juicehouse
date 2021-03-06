import { BigNumber } from '@ethersproject/bignumber'
import { FundingCycle } from 'models/funding-cycle'

import { fromWad, parsePerbicent } from './formatNumber'
import { decodeFCMetadata } from './fundingCycle'

export const weightedRate = (
  fc: FundingCycle | undefined,
  wad: BigNumber | undefined,
  output: 'payer' | 'reserved',
) => {
  if (!fc || !wad) return
  const reserved = decodeFCMetadata(fc.metadata)?.reservedRate

  if (!reserved) return

  return fromWad(
    fc.weight
      .mul(wad)
      .mul(output === 'reserved' ? reserved : parsePerbicent(100).sub(reserved))
      .div(200),
  )
}

export const feeForAmount = (
  target?: BigNumber,
  adminFeePercent?: BigNumber,
) => {
  if (!adminFeePercent || !target) return

  return target.mul(adminFeePercent).div(200)
}
