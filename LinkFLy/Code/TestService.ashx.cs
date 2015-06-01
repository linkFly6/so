using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Web;

namespace LinkFLy.Code
{
    /// <summary>
    /// TestService 的摘要说明
    /// </summary>
    public class TestService : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            var callbackName = context.Request["callback"];
            string timeStr = context.Request["t"];
            string data = context.Request["data"] ?? "";
            int time = 1000;
            if (!string.IsNullOrEmpty(timeStr))
                time = int.Parse(timeStr);
            if (time > 0)
                Thread.Sleep(time);
            context.Response.Write(string.Format("{0}('{1}')", callbackName, data));
        }

        //public void DeferJsonpTest(HttpContext context)
        //{
            
        //}

        public bool IsReusable
        {
            get
            {
                return false;
            }
        }
    }
}