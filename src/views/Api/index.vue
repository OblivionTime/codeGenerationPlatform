<!--
 * @Description: 
 * @Version: 1.0
 * @Autor: solid
 * @Date: 2022-12-01 17:50:27
 * @LastEditors: solid
 * @LastEditTime: 2022-12-02 10:55:10
-->
<template>
  <div>
    <el-card class="box-card">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <div
            style="
              display: flex;
              justify-content: space-between;
              align-items: center;
            "
          >
            <div>URI(路由)</div>
            <div>
              <el-button type="primary" @click="batchGenerateAPI"
                >全部生成</el-button
              >
              <el-button
                icon="el-icon-plus"
                @click="URLList.push({ url: '', method: 'GET' })"
              ></el-button>
            </div>
          </div>
        </div>
        <div v-for="(item, index) in URLList" :key="index" class="text item">
          <div
            style="
              display: flex;
              justify-content: space-between;
              align-items: center;
            "
          >
            <el-input
              v-model="item.url"
              placeholder="请输入路由"
              style="margin: 10px 20px"
            >
              <el-select
                v-model="item.method"
                slot="prepend"
                placeholder="请选择"
                style="width: 100px"
              >
                <el-option
                  :label="item.label"
                  :value="item.value"
                  v-for="item in MethodOptions"
                  :key="item.label"
                ></el-option>
              </el-select>
              <el-button
                type="text"
                circle
                slot="append"
                @click="toGenerateAPI(item, index)"
                >生成API</el-button
              >
            </el-input>
          </div>
        </div>
      </el-card>
      <el-card class="box-card" v-if="resData">
        <div style="height: 500px; overflow: auto; position: relative">
          <div style="position: absolute; right: 20px; top: 40px">
            <el-button
              type="text"
              icon="el-icon-tickets"
              @click="CopyCode(resData)"
            ></el-button>
          </div>
          <pre v-highlightjs> <code class="javascript">{{resData}}</code></pre>
        </div>
      </el-card>
      <el-card class="box-card" v-else>
        <el-card class="box-card" v-for="item in resList" :key="item">
          <div style="position: relative">
            <div style="position: absolute; right: 20px; top: 20px">
              <el-button
                type="text"
                icon="el-icon-tickets"
                @click="CopyCode(item)"
              ></el-button>
            </div>
            <pre v-highlightjs> <code class="javascript">{{item}}</code></pre>
          </div>
        </el-card>
      </el-card>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "API",
  data() {
    return {
      URLList: [{ url: "/accounts/admin_access", method: "GET" }],
      MethodOptions: [
        { label: "GET", value: "GET" },
        { label: "POST", value: "POST" },
        { label: "DELETE", value: "DELETE" },
        { label: "PUT", value: "PUT" },
      ],
      resList: [],
      resData: "",
    };
  },
  methods: {
    //生成API
    toGenerateAPI(item, index) {
      this.resData = "";
      if (!item.url) {
        return this.$message.warning("uri不能为空");
      }
      let url = item.url.replace("/\\/g", "/").split("/").pop();
      let uri = url.slice(0, 1).toUpperCase() + url.slice(1).toLowerCase();
      let code = `
import request from '@/utils/request'
`;
      switch (item.method) {
        case "GET":
          code += `
export function get${uri}(params) {
    return request({
        url: '${item.url}',
        method: 'get',
        params
    })
}`;
          break;
        case "POST":
          code += `
export function post${uri}(data) {
    return request({
        url: '${item.url}',
        method: 'post',
        data
    })
}`;
          break;
        case "PUT":
          code += `
export function put${uri}(data) {
    return request({
        url: '${item.url}',
        method: 'put',
        data
    })
}`;
          break;
        case "DELETE":
          code += `
export function put${uri}(data) {
    return request({
        url: '${item.url}',
        method: 'delete',
        data
    })
}`;
          break;
        default:
          break;
      }
      if (this.resList[index]) {
        this.resList[index] = code;
        this.$forceUpdate();
      } else {
        this.resList.push(code);
      }
    },
    //批量生成API
    batchGenerateAPI() {
        var code = `
import request from '@/utils/request'
`;
      for (const item of this.URLList) {
        if (!item.url) {
          continue;
        }
        let url = item.url.replace("/\\/g", "/").split("/").pop();
        let uri = url.slice(0, 1).toUpperCase() + url.slice(1).toLowerCase();
        switch (item.method) {
          case "GET":
            code += `
export function get${uri}(params) {
    return request({
        url: '${item.url}',
        method: 'get',
        params
    })
}`;
            break;
          case "POST":
            code += `
export function post${uri}(data) {
    return request({
        url: '${item.url}',
        method: 'post',
        data
    })
}`;
            break;
          case "PUT":
            code += `
export function put${uri}(data) {
    return request({
        url: '${item.url}',
        method: 'put',
        data
    })
}`;
            break;
          case "DELETE":
            code += `
export function put${uri}(data) {
    return request({
        url: '${item.url}',
        method: 'delete',
        data
    })
}`;
            break;
          default:
            break;
        }
      }
      this.resData=""
      setTimeout(()=>{
          this.resData = code;
      },50)
    },
    //复制内容
    CopyCode(code) {
      this.$copyText(code)
        .then((e) => {
          this.$message.success("复制成功!!!");
        })
        .catch((err) => {
          this.$message.error("复制失败!!!");
        });
    },
  },
};
</script>


<style>
</style>