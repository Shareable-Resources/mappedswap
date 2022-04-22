<template>
  <div id="customerList">
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
        <el-form-item :label="$t(`customer.walletAddress`)">
          <el-input
            v-model="dialogForm.address"
            :disabled="dialogForm.id ? true : false"
          />
        </el-form-item>
        <el-form-item :label="$t(`customer.name`)">
          <el-input
            v-model="dialogForm.name"
            :disabled="dialogForm.id && !isEdit"
          />
        </el-form-item>
        <el-form-item :label="$t(`customer.credit`)">
          <el-input
            v-model="dialogForm.displayCredit"
            :disabled="dialogForm.id && !isEdit"
          />
        </el-form-item>
        <el-form-item :label="$t(`customer.riskLevel`)">
          <el-input
            v-model="dialogForm.displayRiskLevel"
            :disabled="dialogForm.id && !isEdit"
          />
        </el-form-item>
        <el-form-item :label="$t(`customer.status`)">
          <el-select
            v-model="dialogForm.contractStatus"
            :disabled="dialogForm.id && !isEdit"
            placeholder=""
            style="width: 100%"
          >
            <el-option
              v-for="(label, val) in CUSTOMER_STATUS_OPTION"
              :key="val"
              :label="$t(`${val}`)"
              :value="label"
            />
          </el-select>
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
            v-if="isLoadingBol === false"
            @click="
              dialogForm.id ? (isEdit = false) : (dialogFormVisible = false)
            "
          >{{ $t(`common.cancel`) }}
          </el-button>
          <el-button
            type="primary"
            :loading="isLoadingBol"
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
import { getAllCustomers, addCustomer, updateCustomer } from '@/api/customer'
import { isNumber } from '@/utils/validate'
import { CUSTOMER_STATUS_OPTION } from '@/utils/selection.const'
import {
  amountDivideDecimals,
  amountDivideDecimalsToDisplay,
  amountMultipleDecimals,
  numberToFormattedStringWithNoComma
} from '@/utils'

export default {
  name: 'CustomerList',
  data() {
    return {
      CUSTOMER_STATUS_OPTION: CUSTOMER_STATUS_OPTION,
      filterFormVal: {
        columns: [
          {
            type: 'input',
            model: 'walletAddress',
            label: 'customer.walletAddress',
            placeholder: ''
          },
          {
            type: 'input',
            model: 'customerName',
            label: 'customer.name'
          }
        ],
        default: {
          walletAddress: '',
          customerName: ''
        },
        addAction: this.addAction,
        searchAction: this.searchAction
      },
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
            label: 'customer.walletAddress',
            prop: 'address'
          },
          {
            type: 'show',
            label: 'customer.name',
            prop: 'name'
          },
          {
            type: 'filter',
            label: 'customer.credit',
            prop: 'credit',
            filterFn: (credit) => {
              return amountDivideDecimalsToDisplay(credit, 6)
            }
          },
          {
            type: 'filter',
            prop: 'contractStatus',
            label: 'customer.status',
            filterFn: (contractStatus) => {
              if (contractStatus === 1) return this.$i18n.t('customer.statusOption.enabled')
              return this.$i18n.t('customer.statusOption.disabled')
            }
          },
          {
            type: 'filter',
            label: 'customer.riskLevel',
            prop: 'riskLevel',
            filterFn: (riskLevel) => {
              return amountDivideDecimalsToDisplay(riskLevel, 4)
            }
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
      isLoadingBol: false,
      page: 1,
      pageSize: 20,
      dialogFormVisible: false,
      dialogForm: {},
      isEdit: false
    }
  },
  created() {
    this.getAllCustomersList()
  },
  methods: {
    async getAllCustomersList() {
      this.tableData.loading = true
      const apiResponse = await getAllCustomers(this.page, this.pageSize)
      if (apiResponse && apiResponse.returnCode === 0) {
        if (
          apiResponse.data &&
          apiResponse.data.rows &&
          apiResponse.data.count
        ) {
          const listData = apiResponse.data.rows
          this.tableData.source = listData
          this.tableData.total = parseInt(apiResponse.data.count)
        }
        this.tableData.loading = false
      } else {
        console.log('error')
        this.tableData.source = []
        this.tableData.loading = false
        Message({
          message: 'Network Error!',
          type: 'error',
          duration: 5 * 1000
        })
      }
    },
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`)
      this.pageSize = val
      this.getAllCustomersList()
    },
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`)
      this.page = val
      this.getAllCustomersList()
    },
    searchAction(data) {
      console.log('search', data)
      this.getAllCustomersList(data)
    },
    addAction(data) {
      console.log('add', data)
      this.dialogForm = {}
      this.isLoadingBol = false
      this.dialogFormVisible = true
    },
    handleClick(row) {
      this.isEdit = false
      this.isLoadingBol = false
      this.dialogForm = Object.assign({}, row, {
        displayCredit: amountDivideDecimals(row.credit, 6),
        displayRiskLevel: amountDivideDecimals(row.riskLevel, 4)
      })
      this.dialogFormVisible = true
    },
    handleClose(done) {
      this.dialogForm = {}
      return done()
    },
    handleSubmit() {
      console.log('handleSubmit this.dialogForm:', this.dialogForm)
      if (!this.isEdit) {
        this.addCustomer()
      } else {
        this.updateCustomer()
      }
    },
    async updateCustomer() {
      this.isLoadingBol = true
      if (
        !this.dialogForm.id ||
        !this.dialogForm.address ||
        !this.dialogForm.name ||
        !this.dialogForm.credit ||
        !this.dialogForm.displayCredit ||
        !this.dialogForm.displayRiskLevel
      ) {
        Message({
          message: 'Please input all data!',
          type: 'error',
          duration: 5 * 1000
        })
      } else if (
        !isNumber(this.dialogForm.displayCredit) ||
        !isNumber(this.dialogForm.displayRiskLevel)
      ) {
        Message({
          message: 'Not a number!',
          type: 'error',
          duration: 5 * 1000
        })
      } else {
        const params = {
          id: this.dialogForm.id,
          address: this.dialogForm.address,
          name: this.dialogForm.name,
          credit: numberToFormattedStringWithNoComma(
            amountMultipleDecimals(this.dialogForm.displayCredit, 6),
            0
          ),
          contractStatus: this.dialogForm.contractStatus,
          riskLevel: numberToFormattedStringWithNoComma(
            amountMultipleDecimals(this.dialogForm.displayRiskLevel, 4),
            0
          )
        }
        console.log('params:', params)
        const apiResponse = await updateCustomer(params)
        if (apiResponse && apiResponse.returnCode === 0) {
          Message({
            message: 'Customer updated!',
            type: 'success',
            duration: 5 * 1000
          })
          this.dialogFormVisible = false
          this.getAllCustomersList()
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
      this.isLoadingBol = false
    },
    async addCustomer() {
      this.isLoadingBol = true
      if (
        !this.dialogForm.address ||
        !this.dialogForm.name ||
        !this.dialogForm.displayRiskLevel ||
        !this.dialogForm.displayCredit
      ) {
        Message({
          message: 'Please input all data!',
          type: 'error',
          duration: 5 * 1000
        })
      } else if (
        !isNumber(this.dialogForm.displayCredit) ||
        !isNumber(this.dialogForm.displayRiskLevel)
      ) {
        Message({
          message: 'Not a valid number!',
          type: 'error',
          duration: 5 * 1000
        })
      } else {
        const params = {
          address: this.dialogForm.address,
          name: this.dialogForm.name,
          credit: numberToFormattedStringWithNoComma(
            amountMultipleDecimals(this.dialogForm.displayCredit, 6),
            0
          ),
          contractStatus: this.dialogForm.contractStatus,
          riskLevel: numberToFormattedStringWithNoComma(
            amountMultipleDecimals(this.dialogForm.displayRiskLevel, 4),
            0
          )
        }
        console.log('params:', params)
        const apiResponse = await addCustomer(params)
        if (apiResponse && apiResponse.returnCode === 0) {
          Message({
            message: 'Customer added!',
            type: 'success',
            duration: 5 * 1000
          })
          this.dialogFormVisible = false
          this.getAllCustomersList()
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
      this.isLoadingBol = false
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
