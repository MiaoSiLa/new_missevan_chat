# Gekijou HTTP API

## 获取小剧场信息

``` GET /gekijou/info/<gekijou _id> ```

```
{
  "code": 0,
  "gekijou": <gekijou data>
}
```

## 获取小剧场列表

``` GET /gekijou/list ```

```
query: ?p=<页数> ( 默认为 1 )

{
  "code": 0,
  "page": <当前页数>,
  "pagecount": <总页数>,
  "gekijous": [
    <gekijou data>,
    ...
  ]
}
```

## 增加播放次数

``` POST /gekijou/addplaytimes ```

```
{
  "_id": "<gekijou _id>"
}

{
  "code": 0
}
```

## 赞/收藏

``` POST /gekijou/(good|favorite)/(add|remove) ```

```
{
  "_id": "<gekijou _id>"
}

{
  "code": 0,
  "status": <gekijou user status>
}
```
