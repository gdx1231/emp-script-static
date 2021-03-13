package test;

import org.junit.Test;

import com.gdxsoft.easyweb.resources.Resources;

public class TestResources {

	@Test
	public void testResources() {
		Resources.getResource("/EWA_STYLE/js/fas.js");
		Resources.getResource("/EWA_STYLE/images/loading1.gif");
		Resources.getResource("/EWA_STYLE/images/sss.gif");
	}
}
