<template>
  <div id="customerList">
    <div class="filter-form">
      <filter-form :filter-form="filterFormVal" />
    </div>

    <basic-table :table-data="tableData" />
  </div>
</template>

<script>
import { Message } from 'element-ui'
import { getCustomersBalancesHistories } from '@/api/customer'
import { TXN_TYPE_OPTION, DECATS_TOKEN } from '@/utils/selection.const'
import { getDecimalsByToken, amountDivideDecimalsToDisplay } from '@/utils'

export default {
  name: 'CustomerList',
  data() {
    return {
      filterFormVal: {
        columns: [
          {
            type: 'date',
            model: 'startDate',
            label: 'common.startDate',
            format: 'yyyy/MM/dd'
          },
          {
            type: 'date',
            model: 'endDate',
            label: 'common.endDate',
            format: 'yyyy/MM/dd'
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
          },
          {
            type: 'select',
            model: 'tokenName',
            label: 'customer.token',
            options: DECATS_TOKEN
          },
          {
            type: 'select',
            model: 'txnType',
            label: 'customer.txnType',
            options: TXN_TYPE_OPTION
          }
        ],
        default: {
          startDate: '',
          endDate: '',
          walletAddress: '',
          customerName: '',
          tokenName: '',
          txnType: ''
        },
        searchAction: this.searchAction
      },
      tableData: {
        loading: false,
        source: [],
        columns: [
          {
            type: 'show',
            label: 'customer.walletAddress',
            prop: 'address'
          },
          {
            type: 'show',
            label: 'customer.name',
            prop: 'customer.name'
          },
          {
            type: 'show',
            label: 'customer.token',
            prop: 'token'
          },
          {
            type: 'show',
            label: 'customer.txnType',
            prop: 'type'
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
            type: 'filter',
            label: 'customer.balance',
            prop: 'balance',
            filterFnForRow: (row) => {
              const decimals = getDecimalsByToken(row.token)
              return amountDivideDecimalsToDisplay(row.balance, decimals)
            }
          },
          {
            type: 'show',
            label: 'customer.lastModifiedDate',
            prop: 'lastModifiedDate'
          }
        ],
        currentPage: 1,
        total: 0,
        handleSizeChange: this.handleSizeChange,
        handleCurrentChange: this.handleCurrentChange
      },
      page: 1,
      pageSize: 20
    }
  },
  computed: {},
  created() {
    this.getCustomersBalancesHistories()
  },
  methods: {
    async getCustomersBalancesHistories(searchData = {}) {
      this.tableData.loading = true
      const apiResponse = await getCustomersBalancesHistories(
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
      this.getCustomersBalancesHistories()
    },
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`)
      this.page = val
      this.getCustomersBalancesHistories()
    },
    searchAction(data) {
      console.log('search', data)
      this.getCustomersBalancesHistories(data)
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
