<template>
  <a-tabs :activeKey="activeKey" @tabClick="tabChange">
    <a-tab-pane key="route" tab="路线列表">
      <a-table :columns="columns" :data-source="data" bordered>
        <div
          slot="filterDropdown"
          slot-scope="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }"
          style="padding: 8px"
        >
          <a-input
            v-ant-ref="c => (searchInput = c)"
            placeholder="输入关键字搜索"
            :value="selectedKeys[0]"
            style="width: 188px; margin-bottom: 8px; display: block;"
            @change="e => setSelectedKeys(e.target.value ? [e.target.value] : [])"
            @pressEnter="() => handleSearch(selectedKeys, confirm, column.dataIndex)"
          />
          <a-button
            type="primary"
            icon="search"
            size="small"
            style="width: 90px; margin-right: 8px"
            @click="() => handleSearch(selectedKeys, confirm, column.dataIndex)"
          >
            搜索
          </a-button>
          <a-button size="small" style="width: 90px" @click="() => handleReset(clearFilters)">
            重置
          </a-button>
        </div>
        <template
          v-for="col in ['routeTheme']"
          :slot="col"
          slot-scope="text, record, index">
          <div :key="col">
            <span v-for="(item, index) in record.themeIds"
                  :key="index">{{
                options.find(theme => theme.themeId === item).themeName + (index + 1 === record.themeIds.length ? '' : ',')
              }}</span>
          </div>
        </template>
        <template slot="operation" slot-scope="text, record, index">
          <a-button type="primary" size="small" @click="updateItem(record)">修改</a-button>
          <a-popconfirm title="确定删除?" @confirm="delRoute(record)">
            <a-button type="danger" size="small">删除</a-button>
          </a-popconfirm>
        </template>
      </a-table>
    </a-tab-pane>
    <a-tab-pane key="form" tab="路线管理" force-render>
      <a-modal v-model="visible" title="点位操作" ok-text="保存" cancel-text="取消" @ok="modalSave"
               style="position: fixed;z-index: 10000;">
        <a-form :form="pointFormData" :label-col="{ span: 4,}" :wrapper-col="{ span: 20 }">
          <a-form-item label="点位编号">
            <a-input v-model="pointFormData.pointId" :disabled="true"></a-input>
          </a-form-item>
          <a-form-item label="点位名称">
            <a-input v-model="pointFormData.pointName"></a-input>
          </a-form-item>
          <a-form-item label="点位描述">
            <a-textarea v-model="pointFormData.pointDesc"></a-textarea>
          </a-form-item>
          <a-form-item label="点位内容">
            <a-button style="width: 100%" @click="toContent(pointFormData.pointId, 'point')">
              <a-icon type="fullscreen"/>
              点击编辑
            </a-button>
          </a-form-item>
          <a-form-item label="点位操作">
            <a-button style="width: 100%" type="danger" @click="deletePoint(pointFormData.pointId)">
              <a-icon type="delete"/>
              删除点位
            </a-button>
          </a-form-item>
        </a-form>
      </a-modal>
      <a-form :form="formData" :label-col="{ span: 2,}" :wrapper-col="{ span: 20 }">
        <a-form-item label="路线名称">
          <a-input v-model="formData.routeName"></a-input>
        </a-form-item>
        <a-form-item label="路线描述">
          <a-textarea v-model="formData.routeDesc"></a-textarea>
        </a-form-item>
        <a-form-item label="路线主题">
          <a-select
            v-if="options !== null"
            @select="selectTheme"
            @deselect="deselectTheme"
            mode="multiple"
            placeholder="请选择路线主题"
            style="width: 100%">
            <a-select-option v-for="(item, index) in options" :key="index">
              {{ item.themeName }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="路线内容">
          <a-popconfirm title="自动保存当前内容后切换至内容编辑" @confirm="toContent(formData.routeId, 'route')" okText="确认"
                        cancelText="取消">
            <a-button style="width: 100%">
              <a-icon type="fullscreen"/>
              点击编辑
            </a-button>
          </a-popconfirm>
        </a-form-item>

        <a-form-item label="地图工具">
          <div style="width: 100%; height: 38vh;">
            <a-radio-group v-model="mode" style="position: fixed;float:left;z-index: 9999;margin: 1% 1%"
                           @change="changeMode">
              <a-radio-button value="marker">
                标点
              </a-radio-button>
              <a-radio-button value="polyline" v-if="!formData.update && !already">
                路线
              </a-radio-button>

              <a-radio-button value="json" v-if="!formData.update && !already">
                <a-upload :before-upload="beforeUpload">
                  <a-icon type="upload"/>
                  导入
                </a-upload>
              </a-radio-button>
            </a-radio-group>
            <amap
              style="float: left"
              cache-key="map"
              ref="map"
              view-mode="2D"
              async
              :zoom.sync="zoom"
              :center.sync="center"
              :show-indoor-map="false">
              <amap-marker v-for="(item, index) in points" :position="item" :key="index" @click="clickPoint"/>
              <amap-polyline :path.sync="polyline" v-if="polyline.length !== 0"/>
              <amap-mouse-tool :mode.sync="mode" @draw="onDraw" :clear-when-close="true"/>
            </amap>
          </div>
        </a-form-item>
        <a-form-item label="操作">
          <a-button type="primary" style="width: 100%;" @click="submitForm">提交</a-button>
        </a-form-item>
      </a-form>
    </a-tab-pane>
  </a-tabs>
</template>
<script>

import {
  generateRouteId,
  postPoint,
  postPolyline,
  baseURL,
  postRoute,
  listRoute,
  delEmptyRoute,
  getRouteById, delRoutePoint, listTheme, updatePoint, getPointBaseInfoById
} from "~/plugins/axios";

const columns = [
  {
    title: '路线编号',
    dataIndex: 'routeId',
    width: '20%',
    scopedSlots: {customRender: 'routeId'},
  },
  {
    title: '路线名称',
    dataIndex: 'routeName',
    width: '20%',
    ellipsis: true,
    scopedSlots: {
      filterDropdown: 'filterDropdown',
      filterIcon: 'filterIcon',
      customRender: 'customRender',
    },
    onFilter: (value, record) => record.routeName.toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => {
          this.searchInput.focus();
        });
      }
    }
  },
  {
    title: '路线描述',
    dataIndex: 'routeDesc',
    width: '10%',
    scopedSlots: {customRender: 'routeDesc'},
    ellipsis: true,
  },
  {
    title: '创建时间',
    dataIndex: 'createdTime',
    width: '15%',
    scopedSlots: {customRender: 'createdTime'},
  },

  {
    title: '路线主题',
    dataIndex: 'routeTheme',
    width: '15%',
    scopedSlots: {
      filterDropdown: 'filterDropdown',
      filterIcon: 'filterIcon',
      customRender: 'routeTheme',
    },
    onFilter: (value, record) => {

      return record.routeTheme.toString().toLowerCase().includes(value.toLowerCase())
    },
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => {
          this.searchInput.focus();
        });
      }
    }
  },
  {
    title: '操作',
    dataIndex: 'operation',
    width: '15%',
    scopedSlots: {customRender: 'operation'},
  }
];
const data = []
export default {
  name: 'route',
  mounted() {
    listRoute().then(data => {
      this.data = data
    })
    listTheme().then(data => {
      this.options = data
    })
  },
  data() {
    return {
      searchText: '',
      searchInput: null,
      searchedColumn: '',
      already: false,
      data,
      activeKey: 'route',
      columns,
      options: [],
      zoom: 13,
      center: [110.98, 30.83],
      map: null,
      tileUrl: '',
      mode: '',
      points: [],
      polyline: [],
      visible: false,
      pointFormData: {
        update: false,
      },
      uploadType: '',
      formData: {
        update: false,
        points: [],
        themeIds: []
      },
      pointIds: [],
    };
  },
  methods: {
    handleSearch(selectedKeys, confirm, dataIndex) {
      confirm();
      this.searchText = selectedKeys[0];
      this.searchedColumn = dataIndex;
    },
    handleReset(clearFilters) {
      clearFilters();
      this.searchText = '';
    },
    beforeUpload(file) {
      const _this = this;
      let reader = new FileReader();
      reader.readAsText(file, 'utf-8')
      reader.onload = () => {
        let fileData = JSON.parse(reader.result)
        fileData.forEach(point => {
          _this.polyline.push([point.longitude, point.latitude])
        })
        postPolyline({
          routeId: this.formData.routeId,
          polyline: this.polyline
        }).then(data => {
          _this.already = true
        })
      }
      return false;
    },
    deselectTheme(value, option) {
      console.log(value)
      this.formData.themeIds.splice(this.formData.themeIds.findIndex(item => item === this.options[value].themeId), 1)

    },
    selectTheme(value, option) {
      this.formData.themeIds.push(this.options[value].themeId)
    },
    deletePoint(pointId) {
      delRoutePoint(pointId).then(data => {
        let remove = this.pointIds[this.pointIds.findIndex(item => item.pointId === pointId)];
        this.points.splice(this.points.findIndex(item => item[0] === remove.data[0] && item[1] === remove.data[1]), 1);
        this.visible = false
        this.pointFormData = {
          update: false,
        }

      })
    },
    toContent(id, type) {
      if (type === 'route') {
        this.submitForm()
      } else if (type === 'point') {
        this.modalSave();
      }
      console.log(type)
      this.$router.push({
        path: `/main/content?id=${id}&type=${type}`
      })

    },
    delRoute(record) {
      delEmptyRoute(record.routeId, true).then(data => {
        this.data.splice(this.data.findIndex(item => item === record), 1)
        this.$message.success("删除成功")
      })
    },
    updateItem(record) {
      getRouteById(record.routeId).then(data => {
        this.formData = data
        this.polyline = data.coordinates === null ? [] : data.coordinates
        this.points = data.points === null ? [] : data.points
        this.activeKey = 'form'
        this.formData.update = true
        this.formData.points = this.points
        this.formData.themeIds = []

        data.pointIds.forEach((id, index) => {
          this.pointIds.push({
            pointId: id,
            data: this.points[index]
          })
        })
      })
    },
    submitForm() {
      delete this.formData.points
      postRoute(this.formData).then(data => {
        if (this.formData.update) {
          this.$message.success("更新成功")
        } else {
          this.$message.success("添加成功")
        }
        this.formData = {
          update: false,
          points: [],
          themeIds: []
        }
        listRoute().then(data => {
          this.data = data
          this.activeKey = 'route'
        })
      })
    },
    modalSave() {
      updatePoint(this.pointFormData).then(data => {
        this.visible = false
        this.pointFormData = {}
        this.$message.success("保存成功")
      })
    },
    changeMode(event) {
      if (event.target.value === 'json') {

      }
    },
    clickPoint(event) {
      console.log(event)
      this.pointIds.forEach(item => {
        if (item.data[0] === event.target._position[0] && item.data[1] === event.target._position[1]) {
          if (this.formData.points.length !== 0) {
            let index = this.formData.points.findIndex(point => {
              return point.pointId === item.pointId
            })
            if (index !== -1) {
              this.pointFormData = this.formData.points[index]
            }
          }
          getPointBaseInfoById(item.pointId).then(data => {
            this.pointFormData = data
            this.visible = true
          })
        }
      })
    },
    onDraw(type, obj) {
      switch (type) {
        case "marker":
          postPoint({
            routeId: this.formData.routeId,
            point: obj
          }).then(data => {
            this.points.push(obj)
            this.pointIds.push({
              'pointId': data,
              'data': obj
            })
          })
          break;
        case "polyline":
          this.polyline = []
          obj.forEach(item => {
            this.polyline.push(item)
          })
          postPolyline({
            routeId: this.formData.routeId,
            polyline: this.polyline
          }).then(data => {

          })
          break;
      }
    },
    tabChange(tabKey) {
      this.activeKey = tabKey
      if (tabKey === 'form') {
        if (!this.formData.update) {
          generateRouteId().then(data => {
            this.formData.routeId = data
          })
        }
      }
      if (tabKey === 'route') {
        delEmptyRoute(this.formData.routeId, false).then(data => {
          this.formData = {
            update: false,
            themeIds: []
          }
        })
      }
    },
    uploadStatusChange(event) {
      if (event.file.status === 'done') {
        if (this.uploadType === 'route') {
          this.formData.fileIds.push(event.file.response.data)
        } else {
          this.pointFormData.fileIds.push(event.file.response.data)
        }
      }
    }
  },
};
</script>
<style scoped>
.editable-row-operations a {
  margin-right: 8px;
}
</style>
