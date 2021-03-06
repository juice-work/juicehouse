import { BigNumber, BigNumberish } from '@ethersproject/bignumber'
import moment from 'moment'

export const formatDate = (dateMillis: BigNumberish, format = 'M-D-YY h:mma') =>
  moment(BigNumber.from(dateMillis).toNumber()).format(format)
