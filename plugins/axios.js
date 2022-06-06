import axios from 'axios';
import {message} from "ant-design-vue";

axios.defaults.baseURL = 'http://localhost:8080/zigui';
axios.defaults.timeout = 10000;
axios.defaults.withCredentials = true;
axios.defaults.crossDomain = true;

// 请求拦截器
axios.interceptors.request.use(
  config => {
    return config;
  },
  error => {
    return Promise.error(error);
  }
);

axios.interceptors.response.use(
  response => {
    if (response.status === 200) {
      if (response.data.code === 2000) {
        return Promise.resolve(response.data.data);
      } else {
        message.error(response.data.message)
        return Promise.reject(response.data.message)
      }
    } else {
      return Promise.reject(response);
    }
  },
  error => {
    return Promise.reject(error);
  }
);

const get = function get(url, params) {
  return new Promise((resolve, reject) => {
    axios.get(url, {params}
    ).then(res => {
      resolve(res);
    }).catch(err => {
      reject(err)
    })
  });
}

const post = function post(url, params) {
  return new Promise((resolve, reject) => {
    axios.post(url, params)
      .then(res => {
        resolve(res);
      })
      .catch(err => {
        reject(err)
      })
  });
}

const put = function put(url, params) {
  return new Promise((resolve, reject) => {
    axios.put(url, params)
      .then(res => {
        resolve(res);
      })
      .catch(err => {
        reject(err)
      })
  });
}

const _delete = function _delete(url, params) {
  return new Promise((resolve, reject) => {
    axios.delete(url, params)
      .then(res => {
        resolve(res);
      })
      .catch(err => {
        reject(err)
      })
  });
}
export const baseURL = axios.defaults.baseURL;

export const login = param => post(`/user/login`, param);
export const postPoint = param => post(`/route-point`, param);
export const postPointContent = param => post(`/route-point/content`, param);
export const postPolyline = param => post(`/route/set-polyline`, param);
export const postRoute = param => post(`/route`, param);
export const postTheme = param => post(`/theme`, param);
export const postRouteContent = param => post(`/route/content`, param);
export const postRole = param => post(`/role`, param);
export const postPermission = param => post(`/permission`, param);
export const postUser = param => post(`/user`, param);

export const logout = () => get(`/user/logout`, null);
export const generateRouteId = () => get(`/route/generate`, null);
export const listRoute = () => get(`/route`, null);
export const getRouteById = (routeId) => get(`/route/${routeId}`, null);
export const getRouteContentById = (routeId) => get(`/route/content/${routeId}`, null);
export const getPointContentById = (pointId) => get(`/route-point/content/${pointId}`, null);
export const getPointBaseInfoById = (pointId) => get(`/route-point/base-info/${pointId}`, null);
export const listTheme = () => get(`/theme`, null);
export const listThemeRoutes = (themeId) => get(`/theme/routes/${themeId}`, null);
export const listUser = () => get(`/user`, null);
export const listFile = () => get(`/file`, null);
export const listRole = () => get(`/role`, null);
export const listRouteName = () => get(`/route/route-name`, null);
export const listPermission = () => get(`/permission`, null);
export const changeRoleByUserId = (userId, role) => get(`/user/change-role/${userId}/${role}`, null);
export const addUserRole = (userId, roleId) => get(`/user-role/${userId}/${roleId}`, null);

export const updateUser = (param) => put(`/user`, param);
export const updateTheme = (param) => put(`/theme`, param);
export const updatePoint = (param) => put(`/route-point`, param);
export const updatePermission = (param) => put(`/permission`, param);

export const delEmptyRoute = (routeId, confirm) => _delete(`/route/${routeId}/${confirm}`, null);
export const delRoutePoint = (pointId) => _delete(`/route-point/${pointId}`, null);
export const delThemeById = (themeId) => _delete(`/theme/${themeId}`, null);
export const delFileById = (fileId) => _delete(`/file/${fileId}`, null);
export const delPermissionById = (permissionId) => _delete(`/permission/${permissionId}`, null);
export const delRoleById = (roleId) => _delete(`/role/${roleId}`, null);
export const delUserRole = (userId, roleId) => _delete(`/user-role/${userId}/${roleId}`, null);

