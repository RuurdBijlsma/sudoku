<template>
    <div class="divider">
        <div class="stripe"></div>
    </div>
</template>

<script>
    export default {
        name: "DraggableDivider"
    }
</script>

<style scoped>
    .divider {
        height: 100%;
        width: 15px;
        display: flex;
        justify-content: center;
        cursor: w-resize;
        margin: 10px;
    }

    .stripe {
        height: 100%;
        width: 2px;
        background-color: rgba(128, 128, 128, 0.2);
    }
</style>