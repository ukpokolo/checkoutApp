export function formatToNaira(kobo: number): string{
    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
    }).format(kobo/100)
}