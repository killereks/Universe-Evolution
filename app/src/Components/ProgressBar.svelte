<script>
    export let width = 0;
</script>

<div class="progress">
    <div class="bar" style="width: {width * 100}%;">{(width*100).toFixed(2)}%</div>
</div>

<style>
    .progress {
        width: 100%;
        height: 20px;
        background-color: #e0e0e0;
        border-radius: 5px;
    }
    .bar {
        height: 100%;
        background-color: #e74c3c;
        border-radius: 5px;
    }
</style>