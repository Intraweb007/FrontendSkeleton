<template>
    <h1><slot></slot></h1>
</template>

<script type="text/babel">
    module.exports = {
        ready() {
            console.log('Hello, Vue Component!')
        }
    };
</script>