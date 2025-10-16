import { useState, useEffect } from 'react';

const useFetchItems = (url: string) => {
    const [data, setData] = useState<any[]>([]);  // 逐步累积数据数组
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!url) {
            setError('URL 未提供');
            setLoading(false);
            return;
        }

        const controller = new AbortController();

        const fetchItems = async () => {
            try {
                setLoading(true);
                setError(null);
                setData([]);
                setTotal(0);

                const response = await fetch(url, { signal: controller.signal });
                if (!response.ok) {
                    throw new Error('网络请求失败');
                }

                const reader = response.body?.getReader();
                if (!reader) {
                    throw new Error('响应体不可读');
                }

                const decoder = new TextDecoder();
                let buffer = '';  // 累积缓冲区

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';  // 保留不完整行到下次

                    for (const line of lines) {
                        if (line.trim()) {
                            const item = JSON.parse(line);
                            if ('total' in item && 'success' in item) {
                                // 第一行：元数据
                                setTotal(item.total);
                            } else {
                                // 数据行：预置到数组开头（最新在顶）
                                setData(prev => [item, ...prev]);
                            }
                        }
                    }
                }

                // 处理剩余缓冲
                if (buffer.trim()) {
                    const item = JSON.parse(buffer);
                    if (!('total' in item)) {
                        setData(prev => [...prev, item]);
                    }
                }
            } catch (err) {
                if (err.name !== 'AbortError') {
                    setError(err.message);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchItems();

        // 1.5s 后取消（原逻辑）
        // const timeoutId = setTimeout(() => {
        //     controller.abort();
        //     console.log('请求被取消');
        // }, 1500);

        return () => {
            // clearTimeout(timeoutId);
            controller.abort();
        };
    }, [url]);

    return { data, total, loading, error };
};

export default useFetchItems;