/*
 * @Description: 
 * @Version: 1.0
 * @Autor: solid
 * @Date: 2022-05-17 12:45:40
 * @LastEditors: solid
 * @LastEditTime: 2022-10-28 20:57:38
 */

const title = "代码生成平台"

export default function getPageTitle(pageTitle) {
  if (pageTitle) {
    return `${title} - ${pageTitle} `
  }
  return `${title}`
}
