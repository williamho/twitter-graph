package twittergraph.http

import twittergraph._
import scala.io._
import java.lang.Process
import java.lang.ProcessBuilder
import javax.servlet.http.{HttpServlet, HttpServletRequest => HSReq, HttpServletResponse => HSResp}
import javax.naming.{InitialContext => IC};

class GetData extends HttpServlet {
  val jar = "twitter-graph-assembly-1.0.0.jar" // Should probably not be hardcoded
  val mainclass = "twittergraph.TwitterGraph" 
  val hdfsOutDir = "out"
  
  override def doGet(req : HSReq, resp : HSResp) = {
    resp.setContentType("application/json")
    val writer = resp.getWriter()
    /*
    val id = req.getParameter("id")
    val localOutDir = "/tmp/twittergraph_" + id
    
    new ProcessBuilder(
      "hadoop", "jar",
      jar, mainclass,
      "--hdfs",
      "--id", id,
      "--output", hdfsOutDir
    ).start.waitFor

    new ProcessBuilder(
      "hadoop", "fs", 
      "-getmerge", hdfsOutDir, localOutDir
    ).start.waitFor
    */
    writer.write(
    TwitterGraph.jsonFromFile("/path/to/file")
    )
  }
}

