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
import { getCustomerCreditUpdates } from '@/api/customer'
import { TXN_STATUS_OPTION } from '@/utils/selection.const'
import { amountDivideDecimalsToDisplay } from '@/utils'

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
            format: 'yyyy-MM-dd'
          },
          {
            type: 'date',
            model: 'endDate',
            label: 'common.endDate',
            format: 'yyyy-MM-dd'
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
            model: 'customerStatus',
            label: 'customer.status',
            options: TXN_STATUS_OPTION
          }
        ],
        default: {
          startDate: '',
          endDate: '',
          walletAddress: '',
          customerName: '',
          customerStatus: ''
        },
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
            prop: 'customer.name'
          },
          {
            type: 'filter',
            label: 'customer.origCredit',
            prop: 'origCredit',
            filterFn: (origCredit) => {
              return amountDivideDecimalsToDisplay(origCredit, 6)
            }
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
            type: 'show',
            label: 'customer.txStatus',
            prop: 'txStatus'
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
    this.getCustomerCreditUpdates()
  },
  methods: {
    async getCustomerCreditUpdates(searchData = {}) {
      this.tableData.loading = true
      const apiResponse = await getCustomerCreditUpdates(
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
      this.getCustomerCreditUpdates()
    },
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`)
      this.page = val
      this.getCustomerCreditUpdates()
    },
    searchAction(data) {
      console.log('search', data)
      this.getCustomerCreditUpdates(data)
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
