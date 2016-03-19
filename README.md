# Скелёт вёрстки (Stylus, PostCSS, Lost, Boy, ES6, Vueify)

## Установка

Клонируем репозиторий:

```sh
$ git clone git@github.com:Intraweb007/FrontendSkeleton.git .
```

Устанавливаем зависимости и `gulp` если необходимо:

```sh
$ npm install --global gulp
$ npm install
```

## Описание работы

### Конфиги

Все пути и настройки задач в файле `config/default.json`.

### Основные команды

Все команды можно увидеть в `gulpfile.js`.

* `gulp` или `gulp watch` — запуск `browserSync` с наблюдением за изменениями файлов и автоматическим запуском соответствующих задач.
**Обратите внимание** — запущенный `browserSync` не отслеживает изменения в файлах, которые созданы во время его работы. Поэтому нужно сначала создать файл (js/html/styl/vue) и затем запускать задачу.

* `gulp js:vendor:make` — сжатие и объединение в единый `dist/min/vendor.js` файлов указанных в конфиге `concatVendor.path`.
* `gulp sprite` — создание спрайтов.


## Под капотом:
### Stylus: [Boy](https://github.com/corysimmons/boy), [Lost](https://github.com/corysimmons/lost), [Rupture](https://github.com/jenius/rupture), [Autoprefixer](https://github.com/postcss/autoprefixer), [Vueify](https://github.com/vuejs/vueify)
### HTML File Template: [gulp-file-include](https://github.com/coderhaoxin/gulp-file-include)
### Sprites: [Spritesmith](https://github.com/twolfson/gulp.spritesmith)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.