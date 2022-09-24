import Cookies from 'js-cookie'

const resetAuthData = () => {
  Cookies.remove('accessToken')
  Cookies.remove('refreshToken')
  localStorage.removeItem('daobox.store')
}

export default resetAuthData
