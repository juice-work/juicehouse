import { defaultAbiCoder } from '@ethersproject/abi'
import { BigNumber } from '@ethersproject/bignumber'
import { Button, Col, Form, Row, Space, Steps } from 'antd'
import { ContractName } from 'constants/contract-name'
import { emptyAddress } from 'constants/empty-address'
import { SECONDS_IN_DAY } from 'constants/seconds-in-day'
import { padding } from 'constants/styles/padding'
import { UserContext } from 'contexts/userContext'
import useContractReader from 'hooks/ContractReader'
import { Budget } from 'models/budget'
import { AdvancedBudgetFormFields } from 'models/forms-fields/advanced-budget-form'
import { BudgetFormFields } from 'models/forms-fields/budget-form'
import { TicketsFormFields } from 'models/forms-fields/tickets-form'
import { Step } from 'models/step'
import { useContext, useEffect, useState } from 'react'
import { addressExists } from 'utils/addressExists'
import { bigNumbersDiff } from 'utils/bigNumbersDiff'
import { erc20Contract } from 'utils/erc20Contract'

import WtfCard from '../shared/WtfCard'
import { advancedContractStep } from './steps/advancedContractStep'
import { contractStep } from './steps/contractStep'
import { reviewStep } from './steps/reviewStep'
import { ticketsStep } from './steps/ticketsStep'

export default function ConfigureBudget({
  activeBudget,
}: {
  activeBudget?: Budget
}) {
  const { contracts, transactor, onNeedProvider, userAddress } = useContext(
    UserContext,
  )

  const [ticketsForm] = Form.useForm<TicketsFormFields>()
  const [budgetForm] = Form.useForm<BudgetFormFields>()
  const [budgetAdvancedForm] = Form.useForm<AdvancedBudgetFormFields>()
  const [loadingInitTickets, setLoadingInitTickets] = useState<boolean>(false)
  const [loadingCreateBudget, setLoadingCreateBudget] = useState<boolean>(false)
  const [currentStep, setCurrentStep] = useState<number>(0)

  const ticketsAddress = useContractReader<string>({
    contract: ContractName.TicketStore,
    functionName: 'tickets',
    args: [userAddress],
  })
  const ticketContract = erc20Contract(ticketsAddress)
  const ticketsSymbol = useContractReader<string>({
    contract: ticketContract,
    functionName: 'symbol',
  })
  const ticketsName = useContractReader<string>({
    contract: ticketContract,
    functionName: 'name',
  })
  const juicerFeePercent = useContractReader<BigNumber>({
    contract: ContractName.Juicer,
    functionName: 'fee',
    valueDidChange: bigNumbersDiff,
  })
  const wantTokenAddress = useContractReader<string>({
    contract: ContractName.Juicer,
    functionName: 'stablecoin',
  })
  const wantTokenName = useContractReader<string>({
    contract: erc20Contract(wantTokenAddress),
    functionName: 'symbol',
  })

  const ticketsInitialized = !!ticketsName && !!ticketsSymbol

  useEffect(() => {
    if (activeBudget) {
      budgetForm.setFieldsValue({
        name: activeBudget.name,
        duration: activeBudget.duration
          .div(BigNumber.from(SECONDS_IN_DAY))
          .toNumber(),
        link: activeBudget.link,
        target: activeBudget.target.toNumber(),
      })
      budgetAdvancedForm.setFieldsValue({
        discountRate: activeBudget.discountRate.toNumber(),
        beneficiaryAddress: addressExists(activeBudget.bAddress)
          ? activeBudget.bAddress
          : '--',
        beneficiaryAllocation: activeBudget.b.toNumber(),
        projectAllocation: activeBudget.p.toNumber(),
      })
    }
  }, [activeBudget, budgetForm, budgetAdvancedForm])

  if (ticketsName && ticketsSymbol) {
    ticketsForm.setFieldsValue({
      name: ticketsName,
      symbol: ticketsSymbol,
    })
  }

  async function tryNextStep() {
    const step = steps[currentStep]

    if (step.validate) await step.validate()

    setCurrentStep(currentStep + 1)
  }

  async function initTickets() {
    if (!transactor || !contracts) return onNeedProvider()

    const fields = ticketsForm.getFieldsValue(true)

    if (!fields.name || !fields.symbol) {
      setCurrentStep(1)
      setTimeout(async () => {
        await ticketsForm.validateFields()
      }, 0)
      return
    }

    setLoadingInitTickets(true)

    transactor(
      contracts.TicketStore,
      'issue',
      [
        defaultAbiCoder.encode(['string'], [fields.name]),
        defaultAbiCoder.encode(['string'], [fields.symbol]),
      ],
      {
        onDone: () => setLoadingInitTickets(false),
      },
    )
  }

  function activateContract() {
    if (!transactor || !contracts) return onNeedProvider()

    const fields = {
      ...budgetForm.getFieldsValue(true),
      ...budgetAdvancedForm.getFieldsValue(true),
    }

    if (!fields.target || !fields.duration || !fields.name) {
      setCurrentStep(0)
      setTimeout(async () => {
        await budgetForm.validateFields()
      }, 0)
      return
    }

    setLoadingCreateBudget(true)

    transactor(
      contracts.BudgetStore,
      'configure',
      [
        BigNumber.from(fields.target).toHexString(),
        BigNumber.from(
          fields.duration *
            (process.env.NODE_ENV === 'production' ? SECONDS_IN_DAY : 1),
        ).toHexString(),
        wantTokenAddress,
        fields.name,
        fields.link ?? '',
        BigNumber.from(fields.discountRate).toHexString(),
        BigNumber.from(fields.projectAllocation || 0).toHexString(),
        BigNumber.from(fields.beneficiaryAllocation || 0).toHexString(),
        fields.beneficiaryAddress?.trim() ?? emptyAddress,
      ],
      { onDone: () => setLoadingCreateBudget(false) },
    )
  }

  const steps: Step[] = [
    contractStep({
      form: budgetForm,
      budgetActivated: !!activeBudget,
      wantTokenName,
    }),
    ticketsStep({
      form: ticketsForm,
      ticketsInitialized,
    }),
    advancedContractStep({
      form: budgetAdvancedForm,
      budgetActivated: !!activeBudget,
    }),
    reviewStep({
      ticketsForm,
      budgetForm,
      budgetAdvancedForm,
      ticketsInitialized,
      activeBudget,
      ticketsName,
      ticketsSymbol,
      initTickets,
      activateContract,
      loadingInitTickets,
      loadingCreateBudget,
      userAddress,
      feePercent: juicerFeePercent,
      wantTokenName,
    }),
  ]

  return (
    <div
      style={{
        padding: padding.app,
        maxWidth: '90vw',
        width: 1080,
        margin: 'auto',
      }}
    >
      <Steps
        size="small"
        current={currentStep}
        style={{
          marginBottom: 60,
        }}
      >
        {steps.map((step, i) => (
          <Steps.Step
            key={i}
            onClick={() => setCurrentStep(i)}
            title={step.title}
          />
        ))}
      </Steps>

      <Row align="top">
        <Col span={10}>
          {steps[currentStep].content}

          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              marginTop: 80,
            }}
          >
            {currentStep === 0 ? (
              <div></div>
            ) : (
              <Button onClick={() => setCurrentStep(currentStep - 1)}>
                Back
              </Button>
            )}

            <Space>
              {currentStep === steps.length - 1 ? null : (
                <Button onClick={() => tryNextStep()}>Next</Button>
              )}
              {userAddress ? null : (
                <Button onClick={onNeedProvider} type="primary">
                  Connect a wallet
                </Button>
              )}
            </Space>
          </div>
        </Col>

        <Col
          style={{
            paddingLeft: 80,
          }}
          span={14}
        >
          {steps[currentStep].info?.length ? (
            <WtfCard>
              {steps[currentStep].info?.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </WtfCard>
          ) : null}
        </Col>
      </Row>
    </div>
  )
}