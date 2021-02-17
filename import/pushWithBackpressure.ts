import {Duplex} from "stream";

/**
 * Pushes one or more chunks to a stream stream while handling backpressure.
 * @see: https://github.com/nodejs/help/issues/2695#issuecomment-647887885
 *
 * @example
 * [1, 2, 3, 4, 5, 6, 7, 8, 9 , 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
 * pushWithBackpressure(stream, chunks, () => ...)
 * pushWithBackpressure(stream, ['hi', 'hello'], 'utf8', () => ...)
 * @param {Duplex} stream The Duplex stream the chunks will be pushed to
 * @param {any} chunks The chunk or array of chunks to push to a stream stream
 * @param {string|Function} [encoding] The encoding of each string chunk or callback function
 * @param {Function} [callback] Callback function called after all chunks have been pushed to the stream
 * @param $index
 * @return {Duplex}
 */
export const pushWithBackpressure = (stream: Duplex, chunks, encoding, callback = null, $index = 0) => {
    if (!(stream instanceof Duplex)) {
        throw new TypeError('Argument "stream" must be an instance of Duplex')
    }
    chunks = [].concat(chunks).filter(x => x !== undefined)
    if (typeof encoding === 'function') {
        callback = encoding
        encoding = undefined
    }
    if ($index >= chunks.length) {
        if (typeof callback === 'function') {
            callback()
        }
        return stream
    } else if (!stream.push(chunks[$index], ...([encoding].filter(Boolean)))) {
        const pipedStreams = [].concat(((<any>stream)._readableState || {}).pipes || stream).filter(Boolean)
        let listenerCalled = false
        const drainListener = () => {
            if (listenerCalled) {
                return
            }
            listenerCalled = true
            for (const stream of pipedStreams) {
                stream.removeListener('drain', drainListener)
            }
            pushWithBackpressure(stream, chunks, encoding, callback, $index + 1)
        }
        for (const stream of pipedStreams) {
            stream.once('drain', drainListener)
        }
        return stream
    }
    return pushWithBackpressure(stream, chunks, encoding, callback, $index + 1)
}
