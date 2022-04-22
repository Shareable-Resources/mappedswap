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
import { getAgentDailyReports } from '@/api/settlement'
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
            model: 'tokenName',
            label: 'customer.token'
          }
        ],
        default: {
          startOfDate: '',
          endOfDate: '',
          tokenName: ''
        },
        searchAction: this.searchAction
      },
      tableData: {
        source: [],
        columns: [
          {
            type: 'show',
            label: 'common.date',
            prop: 'createdDate'
          },
          {
            type: 'show',
            label: 'customer.token',
            prop: 'token'
          },
          {
            type: 'filter',
            label: 'agent.directFee',
            prop: 'directFee',
            filterFnForRow: (row) => {
              const decimals = getDecimalsByToken(row.token)
              return amountDivideDecimalsToDisplay(row.directFee, decimals)
            }
          },
          {
            type: 'filter',
            label: 'agent.directInterest',
            prop: 'directInterest',
            filterFnForRow: (row) => {
              const decimals = getDecimalsByToken(row.token)
              return amountDivideDecimalsToDisplay(row.directInterest, decimals)
            }
          },
          {
            type: 'filter',
            label: 'agent.directFeeIncome',
            prop: 'directFeeIncome',
            filterFnForRow: (row) => {
              const decimals = getDecimalsByToken(row.token)
              return amountDivideDecimalsToDisplay(row.directFeeIncome, decimals)
            }
          },
          {
            type: 'filter',
            label: 'agent.directInterestIncome',
            prop: 'directInterestIncome',
            filterFnForRow: (row) => {
              const decimals = getDecimalsByToken(row.token)
              return amountDivideDecimalsToDisplay(row.directInterestIncome, decimals)
            }
          },
          {
            type: 'filter',
            label: 'agent.allSubAgentFee',
            prop: 'allSubAgentFee',
            filterFnForRow: (row) => {
              const decimals = getDecimalsByToken(row.token)
              return amountDivideDecimalsToDisplay(row.allSubAgentFee, decimals)
            }
          },
          {
            type: 'filter',
            label: 'agent.allSubAgentInterest',
            prop: 'allSubAgentInterest',
            filterFnForRow: (row) => {
              const decimals = getDecimalsByToken(row.token)
              return amountDivideDecimalsToDisplay(row.allSubAgentInterest, decimals)
            }
          },
          {
            type: 'filter',
            label: 'agent.allSubAgentFeeIncome',
            prop: 'allSubAgentFeeIncome',
            filterFnForRow: (row) => {
              const decimals = getDecimalsByToken(row.token)
              return amountDivideDecimalsToDisplay(row.allSubAgentFeeIncome, decimals)
            }
          },
          {
            type: 'filter',
            label: 'agent.allSubAgentInterestIncome',
            prop: 'allSubAgentInterestIncome',
            filterFnForRow: (row) => {
              const decimals = getDecimalsByToken(row.token)
              return amountDivideDecimalsToDisplay(row.allSubAgentInterestIncome, decimals)
            }
          },
          {
            type: 'filter',
            label: 'agent.allChildAgentFeeIncome',
            prop: 'allChildAgentFeeIncome',
            filterFnForRow: (row) => {
              const decimals = getDecimalsByToken(row.token)
              return amountDivideDecimalsToDisplay(row.allChildAgentFeeIncome, decimals)
            }
          },
          {
            type: 'filter',
            label: 'agent.allChildAgentInterestIncome',
            prop: 'allChildAgentInterestIncome',
            filterFnForRow: (row) => {
              const decimals = getDecimalsByToken(row.token)
              return amountDivideDecimalsToDisplay(row.allChildAgentInterestIncome, decimals)
            }
          },
          {
            type: 'filter',
            label: 'agent.netAgentFeeIncome',
            prop: 'netAgentFeeIncome',
            filterFnForRow: (row) => {
              const decimals = getDecimalsByToken(row.token)
              return amountDivideDecimalsToDisplay(row.netAgentFeeIncome, decimals)
            }
          },
          {
            type: 'filter',
            label: 'agent.netAgentInterestIncome',
            prop: 'netAgentInterestIncome',
            filterFnForRow: (row) => {
              const decimals = getDecimalsByToken(row.token)
              return amountDivideDecimalsToDisplay(row.netAgentInterestIncome, decimals)
            }
          },
          {
            type: 'filter',
            label: 'agent.totalIncome',
            prop: 'totalIncome',
            filterFnForRow: (row) => {
              const decimals = getDecimalsByToken(row.token)
              return amountDivideDecimalsToDisplay(row.totalIncome, decimals)
            }
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
    this.getAgentDailyReports()
  },
  methods: {
    async getAgentDailyReports(searchData = {}) {
      this.tableData.loading = true
      const apiResponse = await getAgentDailyReports(
        this.page,
        this.pageSize,
        searchData
      )
      if (apiResponse && apiResponse.returnCode === 0) {
        if (
          apiResponse.data &&
          apiResponse.data.data &&
          apiResponse.data.data.rows &&
          apiResponse.data.data.count
        ) {
          const listData = apiResponse.data.data.rows
          this.tableData.source = listData
          this.tableData.total = parseInt(apiResponse.data.data.count)
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
      this.getAgentDailyReports()
      // console.log(`handleSizeChange filterFormVal:`, this.filterFormVal)
      // let searchFormData = {}
      // if (this.filterFormVal && this.filterFormVal.filterFormData){
      //   searchFormData = {...this.filterFormVal.filterFormData};
      // }
      // console.log(`handleSizeChange searchFormData:`, searchFormData)
      // this.getAgentDailyReports(searchFormData)
    },
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`)
      this.page = val
      this.getAgentDailyReports()
    },
    searchAction(data) {
      console.log('search', data)
      this.getAgentDailyReports(data)
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
