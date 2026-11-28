const objectId = /^[a-f0-9]{24}$/i;

export function shoppingLogin(lang: string, product: string, listing: string) {
    return '/' + lang + '/auth?' + new URLSearchParams({ mode: 'login', product, listing });
}

export function afterCustomerLogin(lang: string, search: string) {
    const params = new URLSearchParams(search);
    const product = params.get('product') || '';
    const listing = params.get('listing') || '';
    if (!objectId.test(product) || !objectId.test(listing)) return '/' + lang;
    return '/' + lang + '/products/' + product + '?listing=' + listing + '#listing-' + listing;
}
