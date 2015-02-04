# Chat Room HTTP API

## Overall Fail State

```
{
  "code": <error code>,
  "message": "<error message>"
}
```

## 创建房间

``` POST /newroom ```

```
{
  "id": <room id>,
  "name": "<room name>",
  "type": <room type>,
  "maxNum": <room members max number>,
  "userId": <room creator user id>,
  "userName": <room creator user name>
}
```

### 获取房间列表

```GET /roomlist```

```
{
  
}
```
