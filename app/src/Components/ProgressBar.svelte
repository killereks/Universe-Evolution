<script>
    import Decimal from "decimal.js";


    export let value = new Decimal(0);
    export let max = new Decimal(1);
    export let useLog = false;

    function Percentage() {
        if (useLog){
            let val = Decimal.log10(value).div(Decimal.log10(max)).mul(100).toNumber();
            return Decimal.clamp(val, 0, 100).toNumber();
        }
        let val = value.div(max).mul(100).toNumber();
        return Decimal.clamp(val, 0, 100).toNumber();
    }
</script>

<div class="progress">
    <div class="bar" style="width: {Percentage()}%;"></div>
</div>

<style>
    .progress {
        width: 100%;
        height: 5px;
        background-color: #e0e0e0;
        border-radius: 5px;
    }
    .bar {
        height: 100%;
        background-color: #e74c3c;
        border-radius: 5px;
    }
</style>