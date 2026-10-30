```
docker build -t dw-lms-pub .
```


```
docker run -d \
  --name my-html-app \
  -p 8080:80 \
  my-html-app
```

---

```
docker login
```

```
docker build --no-cache -t tomhoon/dw-lms-pub-app:latest .

```

```
docker push tomhoon/dw-lms-pub-app:latest
```

```
docker pull tomhoon/dw-lms-pub-app:latest
```

```
docker run -d \
  --name dw-lms-pub-app \
  -p 80:80 \
  tomhoon/dw-lms-pub-app:latest
```
