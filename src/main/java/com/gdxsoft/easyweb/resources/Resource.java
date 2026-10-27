package com.gdxsoft.easyweb.resources;

import java.nio.charset.StandardCharsets;

/**
 * 静态资源。构造后不可变，可安全地被多线程/缓存共享。
 */
public class Resource {

	private final String path;
	private final String type;
	private final byte[] buffer;
	private final int status;
	private final boolean binary;
	private final String md5;
	/** 结果是否可缓存：读取时的瞬时故障（如 IO 异常）不缓存，下次请求可重试 */
	private final boolean cacheable;

	Resource(String path, String type, byte[] buffer, int status, boolean binary, String md5, boolean cacheable) {
		this.path = path;
		this.type = type;
		this.buffer = buffer;
		this.status = status;
		this.binary = binary;
		this.md5 = md5;
		this.cacheable = cacheable;
	}

	public String getPath() {
		return path;
	}

	public String getType() {
		return type;
	}

	/**
	 * 文本内容。资源统一以 byte[] 保存，这里按 UTF-8 解码；不缓存解码结果，避免常驻双倍堆。
	 * 二进制资源返回 null。
	 */
	public String getContent() {
		if (binary || buffer == null) {
			return null;
		}
		return new String(buffer, StandardCharsets.UTF_8);
	}

	public byte[] getBuffer() {
		return buffer;
	}

	public int getStatus() {
		return status;
	}

	public boolean isBinary() {
		return binary;
	}

	boolean isCacheable() {
		return cacheable;
	}

	public String getMd5() {
		return md5;
	}

	public String toString() {
		StringBuilder sb = new StringBuilder();
		sb.append(path);
		sb.append(", ");
		sb.append(this.status);
		sb.append(", ");
		sb.append(this.type);

		return sb.toString();
	}
}
