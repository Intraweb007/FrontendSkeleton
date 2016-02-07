# Скелёт вёрстки (Stylus, Lost, Boy, ES6, Vueify)

## Подготовка
Устанавливаем зависимости и `gulp` если необходимо:

```sh
$ npm install --global gulp
$ npm install
```

## Запуск
Все пути и настройки в файле `config/default.json`.

Запускаем при помощи `gulp serve`, компилирование, соединение и сжатие стилей и скриптов происходит автоматически.

Конкатенация и минификация плагинов `gulp compress-vendor`.

Для генерации спрайтов используем `gulp sprite`.

## Под капотом:
### Stylus: [Boy](https://github.com/corysimmons/boy), [Lost](https://github.com/corysimmons/lost), [Rupture](https://github.com/jenius/rupture), [Autoprefixer](https://github.com/postcss/autoprefixer), [Vueify](https://github.com/vuejs/vueify)
### HTML File Template: [gulp-file-include](https://github.com/coderhaoxin/gulp-file-include)
### Sprites: [Spritesmith](https://github.com/twolfson/gulp.spritesmith)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.