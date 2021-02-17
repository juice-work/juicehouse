import { Form, FormProps, Input } from 'antd'
import React from 'react'

export default function BudgetForm({
  props,
  header,
}: {
  props: FormProps<{
    duration: number
    target: number
    link: string
  }>
  header?: string
}) {
  return (
    <Form layout="vertical" {...props}>
      {header ? (
        <Form.Item>
          <h2>{header}</h2>
        </Form.Item>
      ) : null}

      <Form.Item
        extra="How your project is identified on-chain"
        name="name"
        label="Name"
        rules={[{ required: true }]}
      >
        <Input
          className="align-end"
          placeholder="Peach's Juice Stand"
          type="string"
        />
      </Form.Item>
      <Form.Item
        extra="The amount of money you want/need in order to absolutely crush your mission statement."
        name="target"
        label="Amount"
        rules={[{ required: true }]}
      >
        <Input
          className="align-end"
          placeholder="0"
          type="number"
          suffix="DAI"
        />
      </Form.Item>
      <Form.Item
        extra="The duration of this budgeting period."
        name="duration"
        label="Time frame"
        rules={[{ required: true }]}
      >
        <Input
          className="align-end"
          placeholder="30"
          type="number"
          suffix="days"
        />
      </Form.Item>
      <Form.Item
        extra="If you want, a link to your mission statement and your budgeting specs."
        name="link"
        label="Link"
      >
        <Input placeholder="https://docs.google.com/my-budget-info" />
      </Form.Item>
    </Form>
  )
}
