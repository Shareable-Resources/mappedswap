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
  </div>
</template>

<script>
import { Message } from 'element-ui'
import { getInterestHistory } from '@/api/settlement'
import { getDecimalsByToken, amountDivideDecimalsToDisplay } from '@/utils'

export default {
  name: 'CustomerList',
  data() {
    return {
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
          },
          {
            type: 'input',
            model: 'tokenName',
            label: 'customer.token'
          }
        ],
        default: {
          walletAddress: '',
          customerName: '',
          tokenName: ''
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
            prop: 'fromTime'
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
            label: 'customer.token',
            prop: 'token'
          },
          {
            type: 'filter',
            label: 'customer.amount',
            prop: 'amount',
            filterFnForRow: (row) => {
              const decimals = getDecimalsByToken(row.token)
              return amountDivideDecimalsToDisplay(row.amount, decimals)
            }
          },
          {
            type: 'show',
            label: 'customer.timeLength',
            prop: 'timeLength'
          },
          {
            type: 'filter',
            label: 'agent.interestRate',
            prop: 'rate',
            filterFn: (rate) => {
              return amountDivideDecimalsToDisplay(rate, 7)
            }
          },
          {
            type: 'filter',
            label: 'customer.interest',
            prop: 'interest',
            filterFnForRow: (row) => {
              const decimals = getDecimalsByToken(row.token)
              return amountDivideDecimalsToDisplay(row.interest, decimals)
            }
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
      }
    }
  },
  computed: {},
  created() {
    this.getInterestHistory()
  },
  methods: {
    async getInterestHistory(searchData = {}) {
      this.tableData.loading = true
      const apiResponse = await getInterestHistory(
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
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`)
      this.pageSize = val
      this.getInterestHistory()
    },
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`)
      this.page = val
      this.getInterestHistory()
    },
    searchAction(data) {
      console.log('search', data)
      this.getInterestHistory(data)
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
