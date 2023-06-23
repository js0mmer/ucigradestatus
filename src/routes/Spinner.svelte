<script lang="ts">
	export let bgColor = '#d8d8d8';
	export let accentColor = '#ff3a3a';
	export let size = '4em';
	export let thickness = '0.25em';
</script>

<span
	class="loading"
	style={`width: ${size}; height: ${size}; border-width: ${thickness}; border-color: ${bgColor}; border-top-color: ${accentColor};`}
/>

<style>
	.loading {
		border: 0.25em solid #d8d8d8;
		border-radius: 100%;
		animation: rotate 1.5s linear infinite;
		display: block;
	}

	@keyframes rotate {
		from {
			transform: rotate(0);
		}

		to {
			transform: rotate(360deg);
		}
	}
</style>
