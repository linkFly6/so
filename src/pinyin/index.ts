const pinyin = require('pinyin')
import * as path from 'path'
import * as fs from 'fs'
import { hyphenate2CamelCase } from '../format'


/**
 * 城市数据和转拼音
 * npm run city
 */

/**
 * 数据来源：https://github.com/wecatch/china_regions
 */
const data = fs.readFileSync(path.resolve(__dirname, './citys.json'), { encoding: 'utf8' })

const json = JSON.parse(data) as any


Object.keys(json).sort((a: any, b: any) => {
  return a - b
}).forEach((key: string) => {
  const item = json[key]
  item.forEach((v: any) => {
    const piny = pinyin(v.name, {
      style: pinyin.STYLE_NORMAL,
      segment: true,
    })
    v.pinyin = hyphenate2CamelCase(piny.map((v: any[]) => v[0]).join('-'))
  })
})

fs.writeFileSync(path.resolve(__dirname, './citys-new.json'), JSON.stringify(json), {
  encoding: 'utf8',
})

console.log('done')
