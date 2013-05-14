package twittergraph.http

import twittergraph._
import java.io.{File, BufferedReader, InputStreamReader}
import scala.io._
import java.lang.{Process, ProcessBuilder}
import javax.servlet.http.{HttpServlet, HttpServletRequest => HSReq, HttpServletResponse => HSResp}
import javax.naming.{InitialContext => IC};

class GetData extends HttpServlet {
  val jar = "target/twitter-graph-assembly-1.0.0.jar" // Should probably not be hardcoded
  val mainclass = "twittergraph.TwitterGraph" 
  val hdfsOutDir = "twittergraph-out"
  
  override def doGet(req : HSReq, resp : HSResp) = {
    resp.setContentType("application/json")
    val out = resp.getWriter

    val username = Option(req getParameter "user").getOrElse("default").toLowerCase

    val pathToJson = "output/" + username + ".json"
    if (!(new File(pathToJson).isFile)) {
      val localJobOutput = "/tmp/twittergraph-" + username
      TwitterGraph.deleteHdfsFile(hdfsOutDir)
      
      val pb = new ProcessBuilder(
        "hadoop", "jar",
        jar, mainclass,
        "--hdfs",
        "--user", username,
        "--output", hdfsOutDir
      ).start

      Source.fromInputStream(pb.getErrorStream)
        .getLines.foreach 
      { line =>
        out println line
        out flush
      }

      new ProcessBuilder(
        "hadoop", "fs",
        "-getmerge",
        hdfsOutDir,
        localJobOutput
      ).start.waitFor

      val json = TwitterGraph.jsonFromFile(localJobOutput)
      TwitterGraph.writeOutputFile(pathToJson, json)

      out.write(json)
    }
    else {
      Source.fromFile(pathToJson).getLines.foreach(out write _)
    }
  }
}

