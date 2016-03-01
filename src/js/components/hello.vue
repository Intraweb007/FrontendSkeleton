<style lang="stylus">
.hello
    display block
    width 100%
    background #fafafa
    margin 24px 0
    padding 24px 0
    text-align center
</style>

<template>
    <p class="hello">{{ message }}</p>
</template>

<script type="text/babel">
    module.exports = {
        data() {
            return {
                message: "Hello, I am Component!"
            }
        }
    };
</script>