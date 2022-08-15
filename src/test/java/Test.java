import java.io.File;

import com.gdxsoft.easyweb.resources.DemoDataOfHsqldb;
import com.gdxsoft.easyweb.resources.Resource;
import com.gdxsoft.easyweb.resources.Resources;

public class Test {

	public Test() {
	}

	public static void main(String[] args) {
		new Test().testResources();
		new Test().testHsqldb();
	}

	public void testResources() {
		Resource r = Resources.getResource("/EWA_STYLE/js/ewa.js");
		System.out.println(r.toString());
	}
	
	public void testHsqldb() {
		String tmpPath;
		try {
			tmpPath = File.createTempFile("gdx", "").getParent();
			DemoDataOfHsqldb.extract(tmpPath);
		} catch (Exception e) {
			System.err.println(e);
		}

	}
}
