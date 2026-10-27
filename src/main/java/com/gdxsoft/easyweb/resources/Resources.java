package com.gdxsoft.easyweb.resources;

import java.io.IOException;
import java.net.URL;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Resources {
	/**
	 * 
	 */
	private static Logger LOGGER = LoggerFactory.getLogger(Resources.class);

	/** 缓存加载成功的资源，数量受 jar 内文件数约束 */
	private static final Map<String, Resource> CACHED = new ConcurrentHashMap<String, Resource>();

	/**
	 * 缓存失败结果（404 等）。jar 内资源不会变化，失败的结论同样稳定，
	 * 缓存后可避免随机路径反复扫描类路径并刷日志；用上限防止被扫描器撑爆。
	 */
	private static final Map<String, Resource> MISS_CACHED = new ConcurrentHashMap<String, Resource>();
	private static final int MAX_MISS_CACHED = 2048;

	/** 单文件缓存上限，超过则每次请求重新读取；可用 -DempScriptStatic.maxCacheSize 覆盖 */
	private static final long DEFAULT_MAX_CACHED_FILE_SIZE = 5L * 1024 * 1024;

	static long maxCachedFileSize() {
		return Long.getLong("empScriptStatic.maxCacheSize", DEFAULT_MAX_CACHED_FILE_SIZE);
	}

	public static boolean checkValidExt(String ext) {
		if (ext.equalsIgnoreCase("exe") || ext.equalsIgnoreCase("bat") || ext.equalsIgnoreCase("cmd")
				|| ext.equalsIgnoreCase("sh") || ext.equalsIgnoreCase("dmg") || ext.equalsIgnoreCase("java")
				|| ext.equalsIgnoreCase("jsp") || ext.equalsIgnoreCase("class") || ext.equalsIgnoreCase("jar")
				|| ext.equalsIgnoreCase("properties")) {
			return false;
		}

		return true;
	}

	private static Resource loadResource(String path) {
		String ext = FilenameUtils.getExtension(path);

		if (path.indexOf("..") >= 0) {
			LOGGER.warn("Invalid path '..', {}", path);
			return fail(path, 502);
		}

		// not allow blank ext or directory
		if (ext.trim().length() == 0 || ext.trim().endsWith("/")) {
			LOGGER.debug("Blank ext or directory. {}", path);
			return fail(path, 403);
		}
		if (!checkValidExt(ext)) {
			LOGGER.warn("Invalid ext. {}", path);
			return fail(path, 500);
		}

		if (path.indexOf("ewa_conf") >= 0 || path.indexOf("appliaction.yml") >= 0) {
			LOGGER.warn("Invalid file. {}", path);
			return fail(path, 501);
		}

		String pathWithPrefix = "/EmpScriptV2" + path;
		URL url = Resources.class.getResource(pathWithPrefix);
		if (url == null) {
			LOGGER.debug("Not found: {}", path);
			return fail(path, 404);
		}

		boolean binary = false;
		String type;
		if (ext.equalsIgnoreCase("js")) {
			type = "application/javascript";
		} else if (ext.equalsIgnoreCase("htm") || ext.equalsIgnoreCase("html")) {
			type = "text/html";
		} else if (ext.equalsIgnoreCase("txt") || ext.equalsIgnoreCase("csv")) {
			type = "text/plain";
		} else if (ext.equalsIgnoreCase("json")) {
			type = "application/json";
		} else if (ext.equalsIgnoreCase("css")) {
			type = "text/css";
		} else if (ext.equalsIgnoreCase("xml")) {
			type = "application/xml";
		} else if (ext.equalsIgnoreCase("jif") || ext.equalsIgnoreCase("jiff") || ext.equalsIgnoreCase("jpg")
				|| ext.equalsIgnoreCase("jpeg") || ext.equalsIgnoreCase("png") || ext.equalsIgnoreCase("gif")
				|| ext.equalsIgnoreCase("webp") || ext.equalsIgnoreCase("apng")) {
			type = ext;
			if ("jpg".equalsIgnoreCase(type) || type.equalsIgnoreCase("jif") || type.equalsIgnoreCase("jiff")) {
				type = "jpeg";
			}
			type = "image/" + type;
			binary = true;
		} else if (ext.equalsIgnoreCase("woff2") || ext.equalsIgnoreCase("ttf") || ext.equalsIgnoreCase("woff")) {
			type = "font/" + ext;
			binary = true;
		} else {
			type = "application/octet-stream";
			binary = true;
		}

		try {
			byte[] buf = IOUtils.toByteArray(url);
			// 超过单文件上限的大文件不常驻堆，每次请求重新读取
			boolean cacheable = buf.length <= maxCachedFileSize();
			Resource r = new Resource(path, type, buf, 200, binary, MyUtils.md5(buf), cacheable);
			LOGGER.debug(r.toString());
			return r;
		} catch (IOException e) {
			// 读取故障可能是瞬时的，不写入缓存，下次请求重新读取
			LOGGER.error("Read failed: {}", path, e);
			return new Resource(path, type, null, 500, binary, null, false);
		}
	}

	private static Resource fail(String path, int status) {
		return new Resource(path, null, null, status, false, null, true);
	}

	private static String rewritePath(String resourcePath) {
		String path = resourcePath;
		if (path.indexOf("EWA_ALL.js") > 0 || path.indexOf("EWA_ALL.2.0.js") > 0) {
			path = "/EWA_STYLE/js/ewa.js";
		} else if (path.indexOf("EWA_ALL.min.2.0.js") > 0) {
			path = "/EWA_STYLE/js/ewa.min.js";
		} else if (path.indexOf("/ewa.min.map") > 0) {
			path = "/EWA_STYLE/js/ewa.min.map";
		} else if (path.indexOf("/fas.js") >= 0) {
			path = "/EWA_STYLE/js/fas.js";
		} else if (path.indexOf("/jquery/jquery-1.") > 0) {
			path = "/third-party/jquery/jquery-1.12.4.min.js";
		} else if (path.indexOf("/jquery/jquery-3.") > 0) {
			path = "/third-party/jquery/jquery-3.7.1.min.js";
		} else if (path.indexOf("/thrid-party/") == 0) {
			path = path.replace("/thrid-party/", "/third-party/");
		} else if (path.indexOf("/js_jquery/") >= 0 && path.indexOf("EWA_ALL") < 0) {
			path = path.replace("/js_jquery/", "/source/");
		} else if (path.indexOf("/ace/v") >= 0) {
			path = path.replaceAll("/ace/v[\\d.]+/", "/ace/v1.44.0/");
		}

		path = path.replace("//", "/").replace("//", "/").replace("//", "/").replace("//", "/");
		return path;
	}

	/**
	 * Get the EWA static files, js, css, images ...
	 * 
	 * @param resourcePath static path
	 * @return the resource
	 */
	public static Resource getResource(String resourcePath) {
		String path = rewritePath(resourcePath);

		Resource r = CACHED.get(path);
		if (r != null) {
			return r;
		}
		r = MISS_CACHED.get(path);
		if (r != null) {
			return r;
		}

		r = loadResource(path);
		if (r.isCacheable()) {
			// 未命中时可能并发重复加载同一路径，以先入缓存的结果为准
			Map<String, Resource> cache = r.getStatus() == 200 ? CACHED : MISS_CACHED;
			if (cache == CACHED || cache.size() < MAX_MISS_CACHED) {
				Resource prev = cache.putIfAbsent(path, r);
				if (prev != null) {
					return prev;
				}
			}
		}

		return r;
	}

	/**
	 * 清空缓存。开发态（target/classes）改了资源文件后，或测试需要重新加载时调用；
	 * 生产环境资源来自 jar，一般不需要。
	 */
	public static void clear() {
		CACHED.clear();
		MISS_CACHED.clear();
	}

}
