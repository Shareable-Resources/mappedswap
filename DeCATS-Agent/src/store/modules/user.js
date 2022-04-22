import { login, getInfo } from '@/api/user'
import { jwtDecode } from '@/utils'
import {
  getToken,
  setToken,
  removeToken,
  setAgentId,
  removeAgentId,
  setAgentName,
  removeAgentName,
  setAgentaEmail,
  removeAgentEmail
} from '@/utils/auth'
import router, { resetRouter } from '@/router'

const state = {
  token: getToken(),
  name: '',
  avatar: '',
  introduction: '',
  roles: ['admin'],
  tz: 'Asia/Brunei'
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_INTRODUCTION: (state, introduction) => {
    state.introduction = introduction
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  SET_TZ: (state, tz) => {
    state.tz = tz
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    // console.log('user/login start userInfo:', userInfo)
    const { email, password } = userInfo
    return new Promise((resolve, reject) => {
      login({
        email: email.trim(),
        password: password
      }).then(response => {
        const { data } = response
        if (data && data.token && data.id) {
          commit('SET_TOKEN', data.token)
          const tokenDecodeObj = jwtDecode(data.token)
          console.log('tokenDecodeObj:', tokenDecodeObj)
          if (tokenDecodeObj.name) {
            setAgentName(tokenDecodeObj.name)
          }
          setToken(data.token)
          setAgentId(data.id)
          setAgentaEmail(email.trim())
          resolve()
        } else {
          reject('Login failed!')
        }
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        const { data } = response

        if (!data) {
          reject('Verification failed, please Login again.')
        }

        const { roles, name, avatar, introduction } = data

        // roles must be a non-empty array
        if (!roles || roles.length <= 0) {
          reject('getInfo: roles must be a non-null array!')
        }

        commit('SET_ROLES', roles)
        commit('SET_NAME', name)
        commit('SET_AVATAR', avatar)
        commit('SET_INTRODUCTION', introduction)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state, dispatch }) {
    return new Promise((resolve, reject) => {
      // logout(state.token).then(() => {
      //   commit('SET_TOKEN', '')
      //   commit('SET_ROLES', [])
      //   removeToken()
      //   resetRouter()

      //   // reset visited views and cached views
      //   // to fixed https://github.com/PanJiaChen/vue-element-admin/issues/2485
      //   dispatch('tagsView/delAllViews', null, { root: true })

      //   resolve()
      // }).catch(error => {
      //   reject(error)
      // })

      removeToken()
      removeAgentId()
      removeAgentName()
      removeAgentEmail()
      resetRouter()

      // reset visited views and cached views
      // to fixed https://github.com/PanJiaChen/vue-element-admin/issues/2485
      dispatch('tagsView/delAllViews', null, { root: true })

      resolve()
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      removeToken()
      resolve()
    })
  },

  changeTZ({ commit }, tz) {
    return new Promise(resolve => {
      commit('SET_TZ', tz)
      resolve()
    })
  },

  // dynamically modify permissions
  async changeRoles({ commit, dispatch }, role) {
    const token = role + '-token'

    commit('SET_TOKEN', token)
    setToken(token)

    const { roles } = await dispatch('getInfo')

    resetRouter()

    // generate accessible routes map based on roles
    const accessRoutes = await dispatch('permission/generateRoutes', roles, { root: true })
    // dynamically add accessible routes
    router.addRoutes(accessRoutes)

    // reset visited views and cached views
    dispatch('tagsView/delAllViews', null, { root: true })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}