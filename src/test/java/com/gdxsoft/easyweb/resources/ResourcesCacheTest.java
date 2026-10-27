package com.gdxsoft.easyweb.resources;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNotSame;
import static org.junit.Assert.assertSame;
import static org.junit.Assert.assertTrue;

import org.junit.Test;

public class ResourcesCacheTest {

	@Test
	public void testLoadedResourceIsCached() {
		Resource first = Resources.getResource("/EWA_STYLE/js/ewa.js");
		Resource second = Resources.getResource("/EWA_STYLE/js/ewa.js");

		assertEquals(200, first.getStatus());
		assertNotNull(first.getBuffer());
		assertNotNull(first.getContent());
		assertNotNull(first.getMd5());
		assertSame("命中缓存时应返回同一实例", first, second);
	}

	@Test
	public void testRewrittenAliasSharesCacheEntry() {
		Resource canonical = Resources.getResource("/EWA_STYLE/js/ewa.js");
		Resource alias = Resources.getResource("/EWA_ALL.js");

		assertSame(canonical, alias);
	}

	@Test
	public void testMissingResourceIsCached() {
		Resource first = Resources.getResource("/not-exists/definitely-missing.js");
		Resource second = Resources.getResource("/not-exists/definitely-missing.js");

		assertEquals(404, first.getStatus());
		assertSame("失败结果也应缓存，避免反复扫描类路径", first, second);
	}

	@Test
	public void testPathTraversalIsRejected() {
		Resource r = Resources.getResource("/EWA_STYLE/../../etc/passwd.js");

		assertEquals(502, r.getStatus());
	}

	@Test
	public void testDisallowedExtensionIsRejected() {
		Resource r = Resources.getResource("/EWA_STYLE/js/ewa.jsp");

		assertEquals(500, r.getStatus());
		assertTrue(r.getContent() == null && r.getBuffer() == null);
	}

	@Test
	public void testRejectedExtensionIsCached() {
		Resource first = Resources.getResource("/EWA_STYLE/js/ewa.jar");
		Resource second = Resources.getResource("/EWA_STYLE/js/ewa.jar");

		assertEquals(500, first.getStatus());
		assertSame("非法扩展名属于稳定结果，应缓存", first, second);
	}

	@Test
	public void testOversizedFileIsNotCached() {
		System.setProperty("empScriptStatic.maxCacheSize", "1024");
		try {
			Resource first = Resources.getResource("/EWA_STYLE/js/ewa.min.map");
			Resource second = Resources.getResource("/EWA_STYLE/js/ewa.min.map");

			assertEquals(200, first.getStatus());
			assertNotNull(first.getBuffer());
			assertNotSame("超过单文件上限的资源不入缓存", first, second);
		} finally {
			System.clearProperty("empScriptStatic.maxCacheSize");
		}
	}

	@Test
	public void testClearDropsCache() {
		Resource first = Resources.getResource("/EWA_STYLE/js/fas.js");
		Resources.clear();
		Resource second = Resources.getResource("/EWA_STYLE/js/fas.js");

		assertEquals(200, first.getStatus());
		assertEquals(200, second.getStatus());
		assertNotSame("clear 后应重新加载", first, second);
	}
}
