import { getAgentId } from '@/utils/auth'
import request from '@/utils/request'

export function getAllAgent(page, pageSize, searchParams = {}) {
  let searchString = ''
  if (searchParams && searchParams.walletAddress) {
    searchString = searchString + `&address=${searchParams.walletAddress}`
  }
  if (searchParams && searchParams.agentName) {
    searchString = searchString + `&name=${searchParams.agentName}`
  }

  return request({
    url: `/agents?recordPerPage=${pageSize}&pageNo=${page - 1}${searchString}`,
    method: 'get'
  })
}

export function getAgentDetails() {
  const agentId = getAgentId()
  return request({
    url: `/agents/details/${agentId}`,
    method: 'get'
  })
}

export function addAgent(data) {
  return request({
    url: '/agents/create',
    method: 'post',
    data
  })
}

export function updateAgent(agentId, data) {
  return request({
    url: '/agents/update',
    method: 'post',
    data
  })
}
