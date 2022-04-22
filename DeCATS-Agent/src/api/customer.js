import { getAgentId } from '@/utils/auth'
import request from '@/utils/request'

export function getAllCustomers(page, pageSize) {
  const agentId = getAgentId()
  return request({
    url: `customers?agentId=${agentId}&recordPerPage=${pageSize}&pageNo=${page - 1}`,
    method: 'get'
  })
}

export function addCustomer(data) {
  return request({
    url: '/customers/create',
    method: 'post',
    data
  })
}

export function updateCustomer(data) {
  return request({
    url: `/customers/update`,
    method: 'post',
    data
  })
}

export function getCustomersBalance(page, pageSize, searchParams = {}) {
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
  return request({
    url: `balances?recordPerPage=${pageSize}&pageNo=${page - 1}${searchString}`,
    method: 'get'
  })
}

export function getCustomersBalancesHistories(page, pageSize, searchParams = {}) {
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
  return request({
    url: `balancesHistories?recordPerPage=${pageSize}&pageNo=${page - 1}${searchString}`,
    method: 'get'
  })
}

export function getCreditUpdates(page, pageSize, searchParams = {}) {
  const agentId = getAgentId()
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
  return request({
    url: `customers/getCreditUpdates?agentId=${agentId}&pageNo=${page - 1}&recordPerPage=${pageSize}${searchString}`,
    method: 'get'
  })
}

export function getCustomerCreditUpdates(page, pageSize, searchParams = {}) {
  const agentId = getAgentId()
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
  return request({
    url: `customerCreditUpdates?agentId=${agentId}&pageNo=${page - 1}&recordPerPage=${pageSize}${searchString}`,
    method: 'get'
  })
}
