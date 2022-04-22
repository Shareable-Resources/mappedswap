<template>
  <div id="agentList">
    <div class="filter-form">
      <filter-form :filter-form="filterFormVal" />
    </div>

    <basic-table :table-data="tableData" />

    <el-dialog
      width="80%"
      :close-on-click-modal="false"
      :title="dialogForm.id ? $t(`common.details`) : $t(`common.create`)"
      :visible.sync="dialogFormVisible"
      :before-close="handleClose"
    >
      <el-form label-position="left" :model="dialogForm">
        <el-form-item v-if="dialogForm.id ? true : false" label="ID">
          <el-input v-model="dialogForm.id" :disabled="true" />
        </el-form-item>
        <el-form-item :label="$t(`agent.walletAddress`)">
          <el-input
            v-model="dialogForm.address"
            :disabled="dialogForm.id ? true : false"
          />
        </el-form-item>
        <el-form-item :label="$t(`agent.email`)">
          <el-input
            v-model="dialogForm.email"
            :disabled="dialogForm.id && !isEdit"
          />
        </el-form-item>
        <el-form-item
          v-if="dialogForm.id ? false : true"
          :label="$t(`agent.password`)"
        >
          <el-input
            v-model="dialogForm.password"
            type="password"
            :disabled="dialogForm.id && !isEdit"
          />
        </el-form-item>
        <el-form-item
          v-if="dialogForm.id ? false : true"
          :label="$t(`agent.confirmPassword`)"
        >
          <el-input
            v-model="dialogForm.confirmPassword"
            type="password"
            :disabled="dialogForm.id && !isEdit"
          />
        </el-form-item>
        <el-form-item :label="$t(`agent.name`)">
          <el-input
            v-model="dialogForm.name"
            :disabled="dialogForm.id && !isEdit"
          />
        </el-form-item>
        <el-form-item :label="$t(`agent.credit`)">
          <el-input
            v-model="dialogForm.displayTotalCredit"
            :disabled="dialogForm.id && !isEdit"
          />
        </el-form-item>
        <el-form-item
          v-if="dialogForm.id ? true : false"
          :label="$t(`agent.usedCreditForAgents`)"
        >
          <el-input
            v-model="dialogForm.displayAgentTotalCredit"
            :disabled="dialogForm.id ? true : false"
          />
        </el-form-item>
        <el-form-item
          v-if="dialogForm.id ? true : false"
          :label="$t(`agent.usedCreditForCustomers`)"
        >
          <el-input
            v-model="dialogForm.displayCustomerTotalCredit"
            :disabled="dialogForm.id ? true : false"
          />
        </el-form-item>
        <el-form-item :label="$t(`agent.feeRate`)">
          <el-input
            v-model="dialogForm.feePercentage"
            :disabled="dialogForm.id && !isEdit"
          />
        </el-form-item>
        <el-form-item :label="$t(`agent.interestRate`)">
          <el-input
            v-model="dialogForm.interestPercentage"
            :disabled="dialogForm.id && !isEdit"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <div v-if="dialogForm.id && !isEdit">
          <el-button
            @click="dialogFormVisible = false"
          >{{ $t(`common.close`) }}
          </el-button>
          <el-button
            type="danger"
            @click="isEdit = true"
          >{{ $t(`common.edit`) }}
          </el-button>
        </div>
        <div v-else>
          <el-button
            @click="
              dialogForm.id ? (isEdit = false) : (dialogFormVisible = false)
            "
          >{{ $t(`common.cancel`) }}
          </el-button>
          <el-button
            type="primary"
            @click="handleSubmit"
          >{{ $t(`common.confirm`) }}
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { Message } from 'element-ui'
import { getAllAgent, addAgent, updateAgent } from '@/api/agent'
import { isNumber } from '@/utils/validate'
import { deepClone, web3Sha3 } from '@/utils'
import {
  amountDivideDecimals,
  amountDivideDecimalsToDisplay,
  amountMultipleDecimals,
  numberToFormattedStringWithNoComma
} from '@/utils'
import { getAgentId } from '@/utils/auth'

export default {
  name: 'AgentList',
  data() {
    return {
      filterFormVal: {
        columns: [
          {
            type: 'input',
            model: 'walletAddress',
            label: 'agent.walletAddress',
            placeholder: ''
          },
          {
            type: 'input',
            model: 'agentName',
            label: 'agent.name'
          }
        ],
        default: {
          walletAddress: '',
          agentName: ''
        },
        addAction: this.addAction,
        searchAction: this.searchAction,
        resetAction: this.resetAction
      },
      searchData: {},
      tableData: {
        loading: false,
        source: [],
        columns: [
          {
            type: 'show',
            label: 'ID',
            prop: 'id'
          },
          {
            type: 'show',
            label: 'agent.walletAddress',
            prop: 'address'
          },
          {
            type: 'show',
            label: 'agent.email',
            prop: 'email'
          },
          {
            type: 'show',
            label: 'agent.name',
            prop: 'name'
          },
          {
            type: 'filter',
            label: 'agent.credit',
            prop: 'totalCredit',
            filterFn: (totalCredit) => {
              return amountDivideDecimalsToDisplay(totalCredit, 6)
            }
          },
          {
            type: 'filter',
            label: 'agent.usedCreditForAgents',
            prop: 'agentTotalCredit',
            filterFn: (agentTotalCredit) => {
              return amountDivideDecimalsToDisplay(agentTotalCredit, 6)
            }
          },
          {
            type: 'filter',
            label: 'agent.usedCreditForCustomers',
            prop: 'customerTotalCredit',
            filterFn: (customerTotalCredit) => {
              return amountDivideDecimalsToDisplay(customerTotalCredit, 6)
            }
          },
          {
            type: 'show',
            label: 'agent.feeRate',
            prop: 'feePercentage'
          },
          {
            type: 'show',
            label: 'agent.interestRate',
            prop: 'interestPercentage'
          },
          {
            type: 'btns',
            label: 'common.operation',
            btns: [
              {
                type: 'details',
                fn: this.handleClick
              }
            ]
          }
        ],
        currentPage: 1,
        total: 0,
        handleSizeChange: this.handleSizeChange,
        handleCurrentChange: this.handleCurrentChange
      },
      page: 1,
      pageSize: 20,
      dialogFormVisible: false,
      dialogForm: {},
      isEdit: false
    }
  },
  computed: {},
  created() {
    this.getAllAgentList()
  },
  methods: {
    async getAllAgentList() {
      try {
        this.tableData.loading = true
        const apiResponse = await getAllAgent(this.page, this.pageSize, this.searchData)
        if (apiResponse && apiResponse.returnCode === 0) {
          if (
            apiResponse.data &&
            apiResponse.data.rows &&
            apiResponse.data.count
          ) {
            const agentListData = apiResponse.data.rows
            this.tableData.source = agentListData
            this.tableData.total = parseInt(apiResponse.data.count)
          }
          this.tableData.loading = false
        } else {
          console.log('getAllAgentList error')
          this.tableData.source = []
          this.tableData.loading = false
          Message({
            message: 'Network Error!',
            type: 'error',
            duration: 5 * 1000
          })
        }
      } catch (error) {
        this.tableData.loading = false
      }
    },
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`)
      this.pageSize = val
      this.getAllAgentList()
    },
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`)
      this.page = val
      this.getAllAgentList()
    },
    searchAction(data) {
      console.log('search', data)
      this.searchData = deepClone(data)
      this.getAllAgentList()
    },
    resetAction() {
      console.log('resetAction')
      this.searchData = deepClone(this.filterFormVal.default)
      this.getAllAgentList()
    },
    addAction(data) {
      console.log('add', data)
      this.dialogForm = {}
      this.dialogFormVisible = true
    },
    handleClick(row) {
      this.isEdit = false
      const newDisplay = {
        displayTotalCredit: amountDivideDecimals(row.totalCredit, 6),
        displayAgentTotalCredit: amountDivideDecimals(row.agentTotalCredit, 6),
        displayCustomerTotalCredit: amountDivideDecimals(
          row.customerTotalCredit,
          6
        )
      }
      this.dialogForm = Object.assign({}, row, newDisplay)
      this.dialogFormVisible = true
    },
    handleClose(done) {
      this.dialogForm = {}
      return done()
    },
    handleSubmit() {
      console.log('handleSubmit this.dialogForm:', this.dialogForm)
      if (!this.isEdit) {
        this.addAgent()
      } else {
        this.updateAgent()
      }
    },
    async updateAgent() {
      if (
        !this.dialogForm.id ||
        !this.dialogForm.address ||
        !this.dialogForm.name ||
        !this.dialogForm.email ||
        !this.dialogForm.displayTotalCredit ||
        !this.dialogForm.feePercentage ||
        !this.dialogForm.interestPercentage
      ) {
        Message({
          message: 'Please input all data!',
          type: 'error',
          duration: 5 * 1000
        })
      } else if (
        !isNumber(this.dialogForm.displayTotalCredit) ||
        !isNumber(this.dialogForm.feePercentage) ||
        !isNumber(this.dialogForm.interestPercentage)
      ) {
        Message({
          message: 'Not a valid number!',
          type: 'error',
          duration: 5 * 1000
        })
      } else {
        const params = {
          id: this.dialogForm.id,
          address: this.dialogForm.address,
          name: this.dialogForm.name,
          email: this.dialogForm.email,
          totalCredit: numberToFormattedStringWithNoComma(
            amountMultipleDecimals(this.dialogForm.displayTotalCredit, 6),
            0
          ),
          interestPercentage: this.dialogForm.interestPercentage,
          feePercentage: this.dialogForm.feePercentage
        }
        console.log('params:', params)
        const apiResponse = await updateAgent(this.dialogForm.id, params)
        if (apiResponse && apiResponse.returnCode === 0) {
          Message({
            message: 'Agent updated!',
            type: 'success',
            duration: 5 * 1000
          })
          this.dialogFormVisible = false
          this.getAllAgentList()
        } else if (apiResponse && apiResponse.msg) {
          Message({
            message: apiResponse.msg,
            type: 'error',
            duration: 5 * 1000
          })
        } else {
          console.log('error')
          Message({
            message: 'Network Error!',
            type: 'error',
            duration: 5 * 1000
          })
        }
      }
    },
    async addAgent() {
      if (
        !this.dialogForm.address ||
        !this.dialogForm.name ||
        !this.dialogForm.password ||
        !this.dialogForm.confirmPassword ||
        !this.dialogForm.email ||
        !this.dialogForm.displayTotalCredit ||
        !this.dialogForm.feePercentage ||
        !this.dialogForm.interestPercentage
      ) {
        Message({
          message: 'Please input all data!',
          type: 'error',
          duration: 5 * 1000
        })
      } else if (this.dialogForm.password !== this.dialogForm.confirmPassword) {
        Message({
          message: 'Confirm password not correct!',
          type: 'error',
          duration: 5 * 1000
        })
      } else if (
        !isNumber(this.dialogForm.displayTotalCredit) ||
        !isNumber(this.dialogForm.feePercentage) ||
        !isNumber(this.dialogForm.interestPercentage)
      ) {
        Message({
          message: 'Not a valid number!',
          type: 'error',
          duration: 5 * 1000
        })
      } else {
        const passwordHash = web3Sha3(this.dialogForm.password)
        const params = {
          parentAgentId: getAgentId(),
          address: this.dialogForm.address,
          name: this.dialogForm.name,
          password: passwordHash,
          email: this.dialogForm.email,
          totalCredit: numberToFormattedStringWithNoComma(
            amountMultipleDecimals(this.dialogForm.displayTotalCredit, 6),
            0
          ),
          interestPercentage: this.dialogForm.interestPercentage,
          feePercentage: this.dialogForm.feePercentage
        }
        console.log('params:', params)
        const apiResponse = await addAgent(params)
        if (apiResponse && apiResponse.returnCode === 0) {
          Message({
            message: 'Agent added!',
            type: 'success',
            duration: 5 * 1000
          })
          this.dialogFormVisible = false
          this.getAllAgentList()
        } else if (apiResponse && apiResponse.msg) {
          Message({
            message: apiResponse.msg,
            type: 'error',
            duration: 5 * 1000
          })
        } else {
          console.log('error')
          Message({
            message: 'Network Error!',
            type: 'error',
            duration: 5 * 1000
          })
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
