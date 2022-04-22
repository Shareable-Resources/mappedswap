<template>
  <div id="agentList">
    <el-form label-position="left" :model="agentDetailsData">
      <el-form-item label="ID">
        <el-input v-model="agentDetailsData.id" :readonly="true" />
      </el-form-item>
      <el-form-item :label="$t(`agent.walletAddress`)">
        <el-input v-model="agentDetailsData.address" :readonly="true" />
      </el-form-item>
      <el-form-item :label="$t(`agent.email`)">
        <el-input v-model="agentDetailsData.email" :readonly="true" />
      </el-form-item>
      <el-form-item :label="$t(`agent.name`)">
        <el-input v-model="agentDetailsData.name" :readonly="true" />
      </el-form-item>
      <el-form-item :label="$t(`agent.credit`)">
        <el-input v-model="agentDetailsData.totalCredit" :readonly="true" />
      </el-form-item>
      <el-form-item :label="$t(`agent.usedCreditForAgents`)">
        <el-input
          v-model="agentDetailsData.agentTotalCredit"
          :readonly="true"
        />
      </el-form-item>
      <el-form-item :label="$t(`agent.usedCreditForCustomers`)">
        <el-input
          v-model="agentDetailsData.customerTotalCredit"
          :readonly="true"
        />
      </el-form-item>
      <el-form-item :label="$t(`agent.feeRate`)">
        <el-input v-model="agentDetailsData.feePercentage" :readonly="true" />
      </el-form-item>
      <el-form-item :label="$t(`agent.interestRate`)">
        <el-input
          v-model="agentDetailsData.interestPercentage"
          :readonly="true"
        />
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { Message } from 'element-ui'
import { getAgentDetails } from '@/api/agent'
import { amountDivideDecimalsToDisplay } from '@/utils'

export default {
  name: 'AgentList',
  data() {
    return {
      agentDetailsData: {
        id: '',
        address: '',
        name: '',
        email: '',
        totalCredit: '',
        agentTotalCredit: '',
        customerTotalCredit: '',
        interestPercentage: '',
        feePercentage: ''
      }
    }
  },
  computed: {},
  created() {
    this.getAgentDetails()
  },
  methods: {
    async getAgentDetails() {
      try {
        const apiResponse = await getAgentDetails()
        if (
          apiResponse &&
          apiResponse.returnCode === 0 &&
          apiResponse.data
        ) {
          const agentDetailsData = apiResponse.data
          this.agentDetailsData = agentDetailsData
          this.agentDetailsData.totalCredit = amountDivideDecimalsToDisplay(
            this.agentDetailsData.totalCredit,
            6
          )
          this.agentDetailsData.agentTotalCredit =
            amountDivideDecimalsToDisplay(
              this.agentDetailsData.agentTotalCredit,
              6
            )
          this.agentDetailsData.customerTotalCredit =
            amountDivideDecimalsToDisplay(
              this.agentDetailsData.customerTotalCredit,
              6
            )
        } else {
          console.log('getAgentDetails error')
          Message({
            message: 'Network Error!',
            type: 'error',
            duration: 5 * 1000
          })
        }
      } catch (error) {
        console.log('getAgentDetails error')
        Message({
          message: 'Network Error!',
          type: 'error',
          duration: 5 * 1000
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
