
```
npm install
npm run start
```


```
docker build -t castlinker .
docker run -p 1900:1900 castlinker
```
or
```
docker run --name castlinker --network host -e CAST_LINKER_PORT=1901 castlinker
```