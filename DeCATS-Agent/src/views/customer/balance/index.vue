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
import { getCustomersBalance } from '@/api/customer'
import { DECATS_TOKEN } from '@/utils/selection.const'
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
            type: 'select',
            model: 'tokenName',
            label: 'customer.token',
            options: DECATS_TOKEN
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
            label: 'customer.sumOfIncome',
            prop: 'sumOfIncome',
            filterFnForRow: (row) => {
              const decimals = getDecimalsByToken(row.token)
              return amountDivideDecimalsToDisplay(row.sumOfIncome, decimals)
            }
          },
          {
            type: 'filter',
            label: 'customer.usdlValue',
            prop: 'usdlValue',
            filterFnForRow: (row) => {
              const decimals = getDecimalsByToken(row.token)
              return amountDivideDecimalsToDisplay(row.usdlValue, decimals)
            }
          },
          {
            type: 'show',
            label: 'customer.lastModifiedDate',
            prop: 'updateTime'
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
    this.getCustomersBalance()
  },
  methods: {
    async getCustomersBalance(searchData = {}) {
      this.tableData.loading = true
      const apiResponse = await getCustomersBalance(
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
      this.getCustomersBalance()
    },
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`)
      this.page = val
      this.getCustomersBalance()
    },
    searchAction(data) {
      console.log('search', data)
      this.getCustomersBalance(data)
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
