import toSJISFunc from '../helper/to-sjis'

declare global {
    namespace QRCode {
        const toSJIS: typeof toSJISFunc;
    }
}
