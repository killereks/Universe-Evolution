<script>
    import { fly } from "svelte/transition";

    export let title = "No Title";
    export let color = "orange";

</script>

<style>
    .notification {
		color: white;
		padding: 1rem;
		border-radius: 0.5rem;
        margin: 0.2rem;
        animation:  fly-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1),
                    fly-out 0.5s cubic-bezier(0.36, 0, 0.66, -0.56);
        animation-delay: 0s, 3s;
        animation-fill-mode: forwards, forwards;
        z-index: 10;
	}

    .orange { background-color: #d35400; }
    .green { background-color: #2ECC71; }
    .purple { background-color: #9B59B6; }
    .blue { background-color: #3498DB; }


    @keyframes fly-in {
        0% {
            transform: translateX(250px);
        }
        100% {
            transform: translateX(0);
        }
    }

    @keyframes fly-out {
        0% {
            transform: translateX(0);
        }
        100% {
            transform: translateX(250px);
        }
    }
</style>

<div class="notification {color}">
    {title}
</div>