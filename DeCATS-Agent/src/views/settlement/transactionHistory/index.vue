<template>
  <div id="customerList">
    <div class="filter-form">
      <filter-form :filter-form="filterFormVal" />
    </div>

    <basic-table :table-data="tableData" />

    <el-form label-position="left" :model="totalInfo">
      <el-form-item :label="$t(`customer.totalUsdl`)">
        <el-input v-model="totalInfo.USDL" :readonly="true" />
      </el-form-item>
      <el-form-item :label="$t(`customer.totalBtcl`)">
        <el-input v-model="totalInfo.BTCL" :readonly="true" />
      </el-form-item>
      <el-form-item :label="$t(`customer.totalEthl`)">
        <el-input v-model="totalInfo.ETHL" :readonly="true" />
      </el-form-item>
    </el-form>

    <el-dialog
      width="80%"
      :title="$t(`common.details`)"
      :visible.sync="dialogFormVisible"
    >
      <el-form label-position="left" :model="dialogForm">
        <el-form-item :label="$t(`customer.tradeTime`)">
          <el-input v-model="dialogForm.txTime" :readonly="true" />
        </el-form-item>
        <el-form-item :label="$t(`customer.walletAddress`)">
          <el-input v-model="dialogForm.address" :readonly="true" />
        </el-form-item>
        <el-form-item :label="$t(`customer.name`)">
          <el-input v-model="dialogForm.name" :readonly="true" />
        </el-form-item>
        <el-form-item :label="$t(`customer.sellToken`)">
          <el-input v-model="dialogForm.sellToken" :readonly="true" />
        </el-form-item>
        <el-form-item :label="$t(`customer.sellAmount`)">
          <el-input v-model="dialogForm.displaySellAmount" :readonly="true" />
        </el-form-item>
        <el-form-item :label="$t(`customer.buyToken`)">
          <el-input v-model="dialogForm.buyToken" :readonly="true" />
        </el-form-item>
        <el-form-item :label="$t(`customer.buyAmount`)">
          <el-input v-model="dialogForm.displayBuyAmount" :readonly="true" />
        </el-form-item>
        <el-form-item :label="$t(`customer.txHash`)">
          <el-input v-model="dialogForm.txHash" :readonly="true" />
        </el-form-item>
        <el-form-item :label="$t(`customer.txStatus`)">
          <el-input v-model="dialogForm.txStatus" :readonly="true" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button
          @click="dialogFormVisible = false"
        >{{ $t(`common.close`) }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { Message } from 'element-ui'
import { getTransactionHistory } from '@/api/settlement'
import { getDecimalsByToken, amountDivideDecimalsToDisplay } from '@/utils'

export default {
  name: 'CustomerList',
  data() {
    return {
      filterFormVal: {
        columns: [
          {
            type: 'date',
            model: 'startOfDate',
            label: 'common.startDate',
            format: 'yyyy-MM-dd'
          },
          {
            type: 'date',
            model: 'endOfDate',
            label: 'common.endDate',
            format: 'yyyy-MM-dd'
          },
          {
            type: 'input',
            model: 'buyTokenName',
            label: 'customer.buyToken'
          },
          {
            type: 'input',
            model: 'sellTokenName',
            label: 'customer.sellToken'
          },
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
          startOfDate: '',
          endOfDate: '',
          buyTokenName: '',
          sellTokenName: '',
          walletAddress: '',
          customerName: ''
        },
        searchAction: this.searchAction
      },
      tableData: {
        loading: false,
        source: [],
        columns: [
          {
            type: 'show',
            label: 'customer.tradeTime',
            prop: 'txTime'
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
            type: 'show',
            label: 'customer.sellToken',
            prop: 'sellToken'
          },
          {
            type: 'filter',
            label: 'customer.sellAmount',
            prop: 'sellAmount',
            filterFnForRow: (row) => {
              const decimals = getDecimalsByToken(row.sellToken)
              return amountDivideDecimalsToDisplay(row.sellAmount, decimals)
            }
          },
          {
            type: 'show',
            label: 'customer.buyToken',
            prop: 'buyToken'
          },
          {
            type: 'filter',
            label: 'customer.buyAmount',
            prop: 'buyAmount',
            filterFnForRow: (row) => {
              const decimals = getDecimalsByToken(row.buyToken)
              return amountDivideDecimalsToDisplay(row.buyAmount, decimals)
            }
          },
          // {
          //   type: 'show',
          //   label: 'customer.txHash',
          //   prop: 'txHash'
          // },
          {
            type: 'show',
            label: 'customer.txStatus',
            prop: 'txStatus'
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
      totalInfo: {
        USDL: 0,
        BTCL: 0,
        ETHL: 0
      },
      dialogFormVisible: false,
      dialogForm: {}
    }
  },
  computed: {},
  created() {
    this.getTransactionHistory()
  },
  methods: {
    async getTransactionHistory(searchData = {}) {
      this.tableData.loading = true
      const apiResponse = await getTransactionHistory(
        this.page,
        this.pageSize,
        searchData
      )
      if (apiResponse && apiResponse.returnCode === 0) {
        if (
          apiResponse.data &&
          apiResponse.data.rows &&
          apiResponse.data.count
        ) {
          const listData = apiResponse.data.rows
          this.tableData.source = listData
          this.tableData.total = parseInt(apiResponse.data.count)
          this.totalInfo = {
            USDL: amountDivideDecimalsToDisplay(apiResponse.data.USDL, 6),
            BTCL: amountDivideDecimalsToDisplay(apiResponse.data.BTCL, 8),
            ETHL: amountDivideDecimalsToDisplay(apiResponse.data.ETHL, 18)
          }
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
    handleClick(row) {
      const _decimals = getDecimalsByToken(row.buyToken)
      const _buyAmount = amountDivideDecimalsToDisplay(
        row.buyAmount,
        _decimals
      )
      const _sellAmount = amountDivideDecimalsToDisplay(
        row.sellAmount,
        _decimals
      )
      this.dialogForm = Object.assign({}, row, {
        displayBuyAmount: _buyAmount,
        displaySellAmount: _sellAmount
      })
      this.dialogFormVisible = true
    },
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`)
      this.pageSize = val
      this.getTransactionHistory()
    },
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`)
      this.page = val
      this.getTransactionHistory()
    },
    searchAction(data) {
      console.log('search', data)
      this.getTransactionHistory(data)
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
