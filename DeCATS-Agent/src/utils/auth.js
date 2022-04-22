// import Cookies from 'js-cookie'

const TokenKey = 'decats-agent-admin-token'
const AgentIdKey = 'decats-agent-admin-agent-id'
const AgentNameKey = 'decats-agent-admin-agent-name'
const AgentEmailKey = 'decats-agent-admin-agent-email'

export function getToken() {
  return sessionStorage.getItem(TokenKey)
}

export function setToken(token) {
  return sessionStorage.setItem(TokenKey, token)
}

export function removeToken() {
  return sessionStorage.removeItem(TokenKey)
}

export function getAgentId() {
  return sessionStorage.getItem(AgentIdKey)
}

export function setAgentId(agentId) {
  return sessionStorage.setItem(AgentIdKey, agentId)
}

export function removeAgentId() {
  return sessionStorage.removeItem(AgentIdKey)
}

export function getAgentName() {
  return sessionStorage.getItem(AgentNameKey)
}

export function setAgentName(agentName) {
  return sessionStorage.setItem(AgentNameKey, agentName)
}

export function removeAgentName() {
  return sessionStorage.removeItem(AgentNameKey)
}

export function getAgentEmail() {
  return sessionStorage.getItem(AgentEmailKey)
}

export function setAgentaEmail(agentEmail) {
  return sessionStorage.setItem(AgentEmailKey, agentEmail)
}

export function removeAgentEmail() {
  return sessionStorage.removeItem(AgentEmailKey)
}
