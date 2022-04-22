// import { getAgentId } from '@/utils/auth'
import request from '@/utils/request'
import Vue from 'vue'

export function getAgentDailyReports(page, pageSize, searchParams = {}) {
  let searchString = ''

  if (searchParams && searchParams.tokenName) {
    searchString = searchString + `&token=${searchParams.tokenName}`
  }
  if (searchParams && searchParams.startOfDate) {
    const startOfDateStr = Vue.moment(searchParams.startOfDate).format('yyyy-MM-DD')
    searchString = searchString + `&startOfDate=${startOfDateStr}`
  }
  if (searchParams && searchParams.endOfDate) {
    const endOfDateStr = Vue.moment(searchParams.endOfDate).format('yyyy-MM-DD')
    searchString = searchString + `&endOfDate=${endOfDateStr}`
  }
  return request({
    url: `agentDailyReports?pageNo=${page - 1}&recordPerPage=${pageSize}${searchString}`,
    method: 'get'
  })
}

export function getTransactionHistory(page, pageSize, searchParams = {}) {
  let searchString = ''
  if (searchParams && searchParams.walletAddress) {
    searchString = searchString + `&address=${searchParams.walletAddress}`
  }
  if (searchParams && searchParams.buyTokenName) {
    searchString = searchString + `&buyToken=${searchParams.buyTokenName}`
  }
  if (searchParams && searchParams.sellTokenName) {
    searchString = searchString + `&sellToken=${searchParams.sellTokenName}`
  }
  if (searchParams && searchParams.customerName) {
    searchString = searchString + `&name=${searchParams.customerName}`
  }
  if (searchParams && searchParams.startOfDate) {
    const startOfDateStr = Vue.moment(searchParams.startOfDate).format('yyyy-MM-DD')
    searchString = searchString + `&startOfDate=${startOfDateStr}`
  }
  if (searchParams && searchParams.endOfDate) {
    const endOfDateStr = Vue.moment(searchParams.endOfDate).format('yyyy-MM-DD')
    searchString = searchString + `&endOfDate=${endOfDateStr}`
  }
  return request({
    url: `transactions?pageNo=${page - 1}&recordPerPage=${pageSize}${searchString}`,
    method: 'get'
  })
}

export function getInterestHistory(page, pageSize, searchParams = {}) {
  let searchString = ''
  if (searchParams && searchParams.walletAddress) {
    searchString = searchString + `&address=${searchParams.walletAddress}`
  }
  if (searchParams && searchParams.tokenName) {
    searchString = searchString + `&token=${searchParams.tokenName}`
  }
  if (searchParams && searchParams.customerName) {
    searchString = searchString + `&name=${searchParams.customerName}`
  }
  if (searchParams && searchParams.fromTime) {
    const fromTimeStr = Vue.moment(searchParams.fromTime).format('yyyy-MM-DD')
    searchString = searchString + `&fromTime=${fromTimeStr}`
  }
  if (searchParams && searchParams.toTime) {
    const toTimeStr = Vue.moment(searchParams.toTime).format('yyyy-MM-DD')
    searchString = searchString + `&toTime=${toTimeStr}`
  }
  return request({
    url: `interests?pageNo=${page - 1}&recordPerPage=${pageSize}${searchString}`,
    method: 'get'
  })
}
