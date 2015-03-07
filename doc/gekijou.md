# Gekijou HTTP API

## 获取小剧场信息

``` GET /gekijou/info/<gekijou _id> ```

```
{
  "code": 0,
  "gekijou": <gekijou data>
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
