<!--
 * @Description: 
 * @Version: 1.0
 * @Autor: solid
 * @Date: 2022-10-28 20:35:05
 * @LastEditors: solid
 * @LastEditTime: 2022-12-02 11:04:00
-->
<template>
  <div style="padding: 20px">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <el-input v-model="BaseURL" placeholder="请输入请求URL">
          <el-button
            slot="append"
            icon="el-icon-position"
            @click="SendRequest"
          ></el-button>
        </el-input>
      </div>
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <div
            style="
              display: flex;
              justify-content: space-between;
              align-items: center;
            "
          >
            <div>请求头</div>
            <div>
              <el-button
                slot="append"
                icon="el-icon-plus"
                @click="headers.push({ key: '', value: '' })"
              ></el-button>
            </div>
          </div>
        </div>
        <div v-for="(item, index) in headers" :key="index" class="text item">
          <div
            style="
              display: flex;
              justify-content: space-between;
              align-items: center;
            "
          >
            <el-input
              v-model="item.key"
              placeholder="请输入headers的key"
              style="margin: 10px 20px"
            />
            <el-input
              v-model="item.value"
              placeholder="请输入headers的value"
              style="margin-right: 10px"
            />
            <el-button
              type="text"
              icon="el-icon-close"
              circle
              @click="headers.splice(index, 1)"
            ></el-button>
          </div>
        </div>
      </el-card>
      <el-card style="margin: 20px 0" v-if="resData">
        <div slot="header" class="clearfix">
          <el-input v-model="DataPath" placeholder="请输入列表的字段位置">
            <el-button slot="append" @click="toGetColumnName"
              >获取列名</el-button
            >
          </el-input>
        </div>
        <div style="display: flex; justify-content: space-between">
          <div style="width: 48%">
            <ElCollapse v-model="activeName" accordion>
              <ElCollapseItem
                :title="item.title"
                :name="item.title"
                v-for="(item, index) in cols"
                :key="item.title"
                :index="index"
                @dragstart="startDrag"
                @drop="onDrop"
              >
                <el-input
                  type="textarea"
                  autosize
                  placeholder="请输入模板内容"
                  @change="ChangeTmp($event, item.key, index)"
                  v-model="item.tmp"
                >
                </el-input>
              </ElCollapseItem>
            </ElCollapse>
          </div>
          <div style="width: 50%">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <el-button
                  style="float: left"
                  icon="el-icon-view"
                  type="text"
                  circle
                  @click="openpreviewResultsDialog"
                ></el-button>
                <el-button
                  style="float: right"
                  icon="el-icon-tickets"
                  type="text"
                  circle
                  @click="CopyCode"
                ></el-button>
              </div>
              <div style="background: #eee; height: 500px; overflow: auto">
                <pre>
                {{ generatedCodeStart }}
              </pre
                >
                <pre v-for="col in cols" :key="col.key">
                {{ col.tableColumn }}
              </pre
                >
                <pre>
                {{ generatedCodeEnd }}
               </pre
                >
              </div>
            </el-card>
          </div>
        </div>
      </el-card>
      <el-card class="box-card" v-if="resData">
        <div style="height: 500px; overflow: auto">
          <pre v-highlightjs> <code class="json">{{ resData }}</code></pre>
        </div>
      </el-card>
    </el-card>
    <div>
      <el-dialog
        title="预览结果"
        :visible.sync="previewResultsDialog"
        @closed="previewResultsDialog = false"
      >
        <!-- <div v-text="previewResults"></div> -->
        <com1 :html="previewResults" :tableData="tableData"><com></com></com1>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import ElCollapseItem from "@/components/collapse/collapse-item";
import ElCollapse from "@/components/collapse/collapse";
import axios from "@/utils/request";
import Vue from "vue";
let com1 = Vue.component("com1", {
  props: {
    html: String,
    tableData: Array,
  },
});
export default {
  name: "Index",
  components: {
    ElCollapseItem,
    ElCollapse,
  },
  data() {
    return {
      BaseURL:
        "http://localhost:9999/v0/api/autosql/tables/list?page=1&name=addresses",
      headers: [{ key: "", value: "" }],
      activeName: "1",
      resData: "",
      DataPath: "data.data",
      cols: [],
      generatedCodeStart: "",
      generatedCodeEnd: "",
      tableData: [],
      previewResults: "",
      previewResultsDialog: false,
    };
  },
  methods: {
    startDrag: (evt, index) => {
      evt.dataTransfer.dropEffect = "move";
      evt.dataTransfer.effectAllowed = "move";
      evt.dataTransfer.setData("itemID", index);
    },
    onDrop(evt, index) {
      const itemID = evt.dataTransfer.getData("itemID");
      let cols = JSON.parse(JSON.stringify(this.cols));
      let temp = cols[itemID];
      cols[itemID] = cols[index];
      cols[index] = temp;
      this.cols = cols;
    },
    //发送请求
    SendRequest() {
      let headers = {};
      for (const item of this.headers) {
        if (item.key != "") {
          headers[item.key] = headers.value;
        }
      }
      axios
        .get(this.BaseURL, { headers })
        .then((res) => {
          this.resData = res;
        })
        .catch((err) => {
          console.log(err);
        });
    },
    //添加头部
    AddHeaders() {
      this.headers.push({ key: "", value: "" });
    },
    //获取列名
    toGetColumnName() {
      let cols = this.DataPath.split(".");
      let res = JSON.parse(JSON.stringify(this.resData));
      for (const col of cols) {
        res = res[col];
      }
      if (res instanceof Array) {
        if (res.length > 0) {
          this.cols = [];
          for (const key in res[0]) {
            let tableColumn = `
      <el-table-column
        prop="${key}"
        label="${key}"
        align="center"
        :show-overflow-tooltip="true"
      />`;
            this.cols.push({
              title: key,
              key: key,
              tableColumn: tableColumn,
              tmp: "",
            });
          }
          this.generatedCodeStart = `
<el-table
  :data="tableData"
  style="width: 100%"
  stripe
  border
>`;
          this.generatedCodeEnd = `
</el-table>`;
        }
        this.tableData = res;
      }
    },
    //修改模板内容
    ChangeTmp(value, key, index) {
      if (value) {
        this.cols[index].tableColumn = `
        <el-table-column
        prop="${key}"
        label="${key}"
        align="center"
        :show-overflow-tooltip="true"
        >
          <template slot-scope="scope">
            ${value}
          </template>
        </el-table-column>`;
      } else {
        this.cols[index].tableColumn = `
        <el-table-column
          prop="${key}"
          label="${key}"
          align="center"
          :show-overflow-tooltip="true"
        />`;
      }
    },
    //复制代码
    CopyCode() {
      let data = "";
      data += this.generatedCodeStart;
      for (const col of this.cols) {
        data += col.tableColumn;
      }
      data += this.generatedCodeEnd;
      this.$copyText(data)
        .then((e) => {
          this.$message.success("复制成功!!!");
        })
        .catch((err) => {
          this.$message.error("复制失败!!!");
        });
    },
    //
    openpreviewResultsDialog() {
      let data = "";
      data += this.generatedCodeStart;
      for (const col of this.cols) {
        data += col.tableColumn;
      }
      data += this.generatedCodeEnd;
      this.previewResults = data;
      this.previewResultsDialog = true;
      com1.options.template=this.previewResults
    },
  },
};
</script>

<style scope>
pre {
  margin: 0;
  font-size: 14px;
}
</style>