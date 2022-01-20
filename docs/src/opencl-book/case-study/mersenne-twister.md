# Mersenne Twister

This case study will use Mersenne Twister (MT) to generate pseudorandom numbers. This algorithm was developed by a professor at the Hiroshima University in Japan. MT has the following advantages.

• Long period

• Efficient use of memory

• High performance

• Good distribution properties

We will now implement this algorithm using OpenCL.

## _Parallelizing MT_

A full understanding of the MT algorithm requires knowledge of advanced algebra, but the actual program itself is comprised of bit operations and memory accesses.

MT starts out with an initial state made up of an array of bits. By going through a process called "tempering" on this state, an array of random numbers is generated. The initial state then undergoes a set of operations, which creates another state. An array of random numbers is again generated from this state. In this manner, more random numbers are generated. A block diagram of the steps is shown in **Figure 6.8**.

**Figure 6.8: MT processing**

![](<../.gitbook/assets/Screen Shot 2022-01-11 at 10.59.26 PM.png>)

Studying the diagram in **Figure 6.8**, we see a dependency of the states, which gets in the way of parallel processing. To get around this problem, the following 2 methods come to mind.

• Parallelize the state change operation

The state is made up of a series of 32-bit words. Since the next state generation is done by operating on one 32-bit word at a time, each processing of the word can be parallelized. However, since the processing on each word does not require many instructions, and depending on the cost of synchronization, performance may potentially suffer from parallelization. Also, since the number of processes that can be parallelized is dependent on the number of words that make up the state, it may not be enough to take advantage of the 100s of cores on GPUs. This type of processing would benefit more from using a SIMD unit that has low synchronization cost and designed to run few processes in parallel.

• Create numerous initial states, and process these in parallel

Since the dependency is between each state, generating an initial state for each processing element will allow for parallel execution of the MT algorithm. If the code is executed on Tesla C1060, for example, 240 MT can be processed in parallel. The generated random number, however, would not be the same as that generated sequentially from one state.

We will use the latter method, in order to run OpenCL on the GPU.

## _Dynamic Creator (dc)_

NVIDIA's CUDA SDK sample contains a method called the Dynamic Creator (dc) which can be used to generate random numbers over multiple devices \[7]. This section will show how to generate random numbers in OpenCL using "dc".

"dc" is a library that dynamically creates Mersenne Twisters parameters. The sample code in **List 6.15** below shows how the get\_mt\_parameters() function in the "dc" library can be used. In this code, 32 sets of parameters are generated, but this can be changed by using a different value for the variable "n".

**List 6.15: Using "dc" to generate Mersenne Twisters parameters**

```
#include <stdio.h>
#include "dc.h"
int main(int argc, char **argv)
{
    int i, n = 32;
    mt_struct **mts;
    init_dc(4172);
    mts = get_mt_parameters(32, 521, n);
    for (i = 0; i < n; i++)
    {
        printf("{ %d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d }\n",
               mts[i]->aaa, mts[i]->mm, mts[i]->nn, mts[i]->rr, mts[i]->ww, mts[i]->wmask, mts[i]->umask,
               mts[i]->lmask, mts[i]->shift0, mts[i]->shift1, mts[i]->shiftB, mts[i]->shiftC,
               mts[i]->maskB, mts[i]->maskC);
    }
    return 0;
}
```

## _OpenCL MT_

We will now implement MT in OpenCL. We will use the Mersenne Twister algorithm to generate random numbers, then use these numbers to compute the value of PI using the Monte Carlo method.

The Monte Carlo method can be used as follows. Assume that a quarter of a circle is contained in a square, such that the radius of the circle and the edge of the square are equivalent (**Figure 6.9**). Now points are chosen at random inside the square, which can be used to figure out if that point is within the quarter of a circle. Using the proportion of hit versus the number of points, and using the fact that the radius of the circle equals the edge of the square, the value of PI can be computed. Since the area of the quarter of a circle is PI \* R^2 / 4, and the area of the square is R^2, the proportion of the area inside the circle is equal to PI / 4. When this is equated to the proportion found using the Monte Carlo method, solving for PI, we would get PI = 4 \* (proportion).

**Figure 6.9: Computing PI using Monte Carlo**

![](<../.gitbook/assets/Screen Shot 2022-01-11 at 11.01.35 PM.png>)

![](<../.gitbook/assets/Screen Shot 2022-01-11 at 11.02.16 PM.png>)

**List 6.16** shows the kernel code and **List 6.17** shows the host code for this program. The host program includes the commands required to measure the execution time, which we will use when we get to the optimization phase.

**List 6.16: Kernel Code**

```
typedef struct mt_struct_s
{
    uint aaa;
    int mm, nn, rr, ww;
    uint wmask, umask, lmask;
    int shift0, shift1, shiftB, shiftC;
    uint maskB, maskC;
} mt_struct;

/* Initialize state using a seed */
static void sgenrand_mt(uint seed, __global const mt_struct *mts, uint *state)
{
    int i;
    for (i = 0; i < mts->nn; i++)
    {
        state[i] = seed;
        seed = (1812433253 * (seed ^ (seed >> 30))) + i + 1;
    }
    for (i = 0; i < mts->nn; i++)
        state[i] &= mts->wmask;
}

/* Update state */
static void update_state(__global const mt_struct *mts, uint *st)
{
    int n = mts->nn, m = mts->mm;
    uint aa = mts->aaa, x;
    uint uuu = mts->umask, lll = mts->lmask;
    int k, lim;
    lim = n - m;
    for (k = 0; k < lim; k++)
    {
        x = (st[k] & uuu) | (st[k + 1] & lll);
        st[k] = st[k + m] ^ (x >> 1) ^ (x & 1U ? aa : 0U);
    }
    lim = n - 1;
    for (; k < lim; k++)
    {
        x = (st[k] & uuu) | (st[k + 1] & lll);
        st[k] = st[k + m - n] ^ (x >> 1) ^ (x & 1U ? aa : 0U);
    }
    x = (st[n - 1] & uuu) | (st[0] & lll);
    st[n - 1] = st[m - 1] ^ (x >> 1) ^ (x & 1U ? aa : 0U);
}

static inline void gen(__global uint *out, const __global mt_struct *mts, uint *state, int num_rand)
{
    int i, j, n, nn = mts->nn;
    n = (num_rand + (nn - 1)) / nn;
    for (i = 0; i < n; i++)
    {
        int m = nn;
        if (i == n - 1)
            m = num_rand % nn;
        update_state(mts, state);
        for (j = 0; j < m; j++)
        {
            /* Generate random numbers */
            uint x = state[j];
            x ^= x >> mts->shift0;
            x ^= (x << mts->shiftB) & mts->maskB;
            x ^= (x << mts->shiftC) & mts->maskC;
            x ^= x >> mts->shift1;
            out[i * nn + j] = x;
        }
    }
}

__kernel void genrand(__global uint *out, __global mt_struct *mts, int num_rand)
{
    int gid = get_global_id(0);
    uint seed = gid * 3;
    uint state[17];
    mts += gid;                                    /* mts for this item */
    out += gid * num_rand;                         /* Output buffer for this item */
    sgenrand_mt(0x33ff * gid, mts, (uint *)state); /* Initialize random numbers */
    gen(out, mts, (uint *)state, num_rand);        /* Generate random numbers */
}

/* Count the number of points within the circle */
__kernel void calc_pi(__global uint *out, __global uint *rand, int num_rand)
{
    int gid = get_global_id(0);
    int count = 0;
    int i;

    rand += gid * num_rand;

    for (i = 0; i < num_rand; i++)
    {
        float x, y, len;
        x = ((float)(rand[i] >> 16)) / 65535.0f;    /* x coordinate */
        y = ((float)(rand[i] & 0xffff)) / 65535.0f; /* y coordinate */
        len = (x * x + y * y);                      /* Distance from the origin */

        if (len < 1)
        { /* sqrt(len) < 1 = len < 1 */
            count++;
        }
    }

    out[gid] = count;
}
```

**List 6.17: Host Code**

```
#include <stdlib.h>
#include <CL/cl.h>
#include <stdio.h>
#include <math.h>

typedef struct mt_struct_s
{
    cl_uint aaa;
    cl_int mm, nn, rr, ww;
    cl_uint wmask, umask, lmask;
    cl_int shift0, shift1, shiftB, shiftC;
    cl_uint maskB, maskC;
} mt_struct;

mt_struct mts[] = {
    /* Parameters generated by the Dynamic Creater */
    {-822663744, 8, 17, 23, 32, -1, -8388608, 8388607, 12, 18, 7, 15, -1514742400, -2785280},
    {-189104639, 8, 17, 23, 32, -1, -8388608, 8388607, 12, 18, 7, 15, -1263215232, -2785280},
    {-1162865726, 8, 17, 23, 32, -1, -8388608, 8388607, 12, 18, 7, 15, -1242112640, -2686976},
    {-1028775805, 8, 17, 23, 32, -1, -8388608, 8388607, 12, 18, 7, 15, -688432512, -2785280},
    {-1154537980, 8, 17, 23, 32, -1, -8388608, 8388607, 12, 18, 7, 15, 1702190464, -2785280},
    {-489740155, 8, 17, 23, 32, -1, -8388608, 8388607, 12, 18, 7, 15, 938827392, -34275328},
    {-2145422714, 8, 17, 23, 32, -1, -8388608, 8388607, 12, 18, 7, 15, 1722112896, -2818048},
    {-1611140857, 8, 17, 23, 32, -1, -8388608, 8388607, 12, 18, 7, 15, -173220480, -2785280},
    {-1514624952, 8, 17, 23, 32, -1, -8388608, 8388607, 12, 18, 7, 15, 1970625920, -2785280},
    {-250871863, 8, 17, 23, 32, -1, -8388608, 8388607, 12, 18, 7, 15, -605200512, -45776896},
    {-504393846, 8, 17, 23, 32, -1, -8388608, 8388607, 12, 18, 7, 15, -1535844992, -2818048},
    {-96493045, 8, 17, 23, 32, -1, -8388608, 8388607, 12, 18, 7, 15, -608739712, -36339712},
    {-291834292, 8, 17, 23, 32, -1, -8388608, 8388607, 12, 18, 7, 15, -151201152, -1736704},
    {-171838771, 8, 17, 23, 32, -1, -8388608, 8388607, 12, 18, 7, 15, -411738496, -36372480},
    {-588451954, 8, 17, 23, 32, -1, -8388608, 8388607, 12, 18, 7, 15, -1494951296, -2785280},
    {-72754417, 8, 17, 23, 32, -1, -8388608, 8388607, 12, 18, 7, 15, 1727880064, -688128},
    {-1086664688, 8, 17, 23, 32, -1, -8388608, 8388607, 12, 18, 7, 15, -1230685312, -8552448},
    {-558849839, 8, 17, 23, 32, -1, -8388608, 8388607, 12, 18, 7, 15, -1946722688, -34242560},
    {-1723207278, 8, 17, 23, 32, -1, -8388608, 8388607, 12, 18, 7, 15, 2000501632, -1114112},
    {-1779704749, 8, 17, 23, 32, -1, -8388608, 8388607, 12, 18, 7, 15, 1004886656, -2785280},
    {-2061554476, 8, 17, 23, 32, -1, -8388608, 8388607, 12, 18, 7, 15, 1958042496, -2785280},
    {-1524638763, 8, 17, 23, 32, -1, -8388608, 8388607, 12, 18, 7, 15, 653090688, -34177024},
    {-474740330, 8, 17, 23, 32, -1, -8388608, 8388607, 12, 18, 7, 15, -1263215232, -3833856},
    {-1001052777, 8, 17, 23, 32, -1, -8388608, 8388607, 12, 18, 7, 15, 921000576, -196608},
    {-1331085928, 8, 17, 23, 32, -1, -8388608, 8388607, 12, 18, 7, 15, -453715328, -2785280},
    {-883314023, 8, 17, 23, 32, -1, -8388608, 8388607, 12, 18, 7, 15, -184755584, -2785280},
    {-692780774, 8, 17, 23, 32, -1, -8388608, 8388607, 12, 18, 7, 15, -638264704, -2785280},
    {-1009388965, 8, 17, 23, 32, -1, -8388608, 8388607, 12, 18, 7, 15, 1001217664, -36339712},
    {-690295716, 8, 17, 23, 32, -1, -8388608, 8388607, 12, 18, 7, 15, 922049152, -1769472},
    {-1787515619, 8, 17, 23, 32, -1, -8388608, 8388607, 12, 18, 7, 15, 1970625920, -688128},
    {-1172830434, 8, 17, 23, 32, -1, -8388608, 8388607, 12, 18, 7, 15, 720452480, -2654208},
    {-746112289, 8, 17, 23, 32, -1, -8388608, 8388607, 12, 18, 7, 15, 2000509824, -2785280},
};

#define MAX_SOURCE_SIZE (0x100000)

int main()
{
    cl_int num_rand = 4096 * 256;                                   /* The number of random numbers generated using one generator */
    int count_all, i, num_generator = sizeof(mts) / sizeof(mts[0]); /* The number of generators */
    double pi;
    cl_platform_id platform_id = NULL;
    cl_uint ret_num_platforms;
    cl_device_id device_id = NULL;
    cl_uint ret_num_devices;
    cl_context context = NULL;
    cl_command_queue command_queue = NULL;
    cl_program program = NULL;
    cl_kernel kernel_mt = NULL, kernel_pi = NULL;
    size_t kernel_code_size;
    char *kernel_src_str;
    cl_uint *result;
    cl_int ret;
    FILE *fp;
    cl_mem rand, count;
    size_t global_item_size[3], local_item_size[3];
    cl_mem dev_mts;
    cl_event ev_mt_end, ev_pi_end, ev_copy_end;
    cl_ulong prof_start, prof_mt_end, prof_pi_end, prof_copy_end;

    clGetPlatformIDs(1, &platform_id, &ret_num_platforms);
    clGetDeviceIDs(platform_id, CL_DEVICE_TYPE_DEFAULT, 1, &device_id,
                   &ret_num_devices);
    context = clCreateContext(NULL, 1, &device_id, NULL, NULL, &ret);
    result = (cl_uint *)malloc(sizeof(cl_uint) * num_generator);

    command_queue = clCreateCommandQueue(context, device_id, CL_QUEUE_PROFILING_ENABLE, &ret);
    fp = fopen("mt.cl", "r");
    kernel_src_str = (char *)malloc(MAX_SOURCE_SIZE);
    kernel_code_size = fread(kernel_src_str, 1, MAX_SOURCE_SIZE, fp);
    fclose(fp);

    /* Create output buffer */
    rand = clCreateBuffer(context, CL_MEM_READ_WRITE, sizeof(cl_uint) * num_rand * num_generator, NULL, &ret);
    count = clCreateBuffer(context, CL_MEM_READ_WRITE, sizeof(cl_uint) * num_generator, NULL, &ret);

    /* Build Program*/
    program = clCreateProgramWithSource(context, 1, (const char **)&kernel_src_str,
                                        (const size_t *)&kernel_code_size, &ret);
    clBuildProgram(program, 1, &device_id, "", NULL, NULL);
    kernel_mt = clCreateKernel(program, "genrand", &ret);
    kernel_pi = clCreateKernel(program, "calc_pi", &ret);

    /* Create input parameter */
    dev_mts = clCreateBuffer(context, CL_MEM_READ_WRITE, sizeof(mts), NULL, &ret);
    clEnqueueWriteBuffer(command_queue, dev_mts, CL_TRUE, 0, sizeof(mts), mts, 0, NULL, NULL);

    /* Set Kernel Arguments */
    clSetKernelArg(kernel_mt, 0, sizeof(cl_mem), (void *)&rand);    /* Random numbers (output of genrand) */
    clSetKernelArg(kernel_mt, 1, sizeof(cl_mem), (void *)&dev_mts); /* MT parameter (input to genrand) */
    clSetKernelArg(kernel_mt, 2, sizeof(num_rand), &num_rand);      /* Number of random numbers to generate */

    clSetKernelArg(kernel_pi, 0, sizeof(cl_mem), (void *)&count); /* Counter for points within circle (output of calc_pi) */
    clSetKernelArg(kernel_pi, 1, sizeof(cl_mem), (void *)&rand);  /* Random numbers (input to calc_pi) */
    clSetKernelArg(kernel_pi, 2, sizeof(num_rand), &num_rand);    /* Number of random numbers used */

    global_item_size[0] = num_generator;
    global_item_size[1] = 1;
    global_item_size[2] = 1;
    local_item_size[0] = num_generator;
    local_item_size[1] = 1;
    local_item_size[2] = 1;

    /* Create a random number array */
    clEnqueueNDRangeKernel(command_queue, kernel_mt, 1, NULL, global_item_size, local_item_size, 0, NULL, &ev_mt_end);

    /* Compute PI */
    clEnqueueNDRangeKernel(command_queue, kernel_pi, 1, NULL, global_item_size, local_item_size, 0, NULL, &ev_pi_end);

    /* Get result */
    clEnqueueReadBuffer(command_queue, count, CL_TRUE, 0, sizeof(cl_uint) * num_generator, result, 0, NULL, &ev_copy_end);

    /* Average the values of PI */
    count_all = 0;
    for (i = 0; i < num_generator; i++)
    {
        count_all += result[i];
    }

    pi = ((double)count_all) / (num_rand * num_generator) * 4;
    printf("pi = %f¥n", pi);

    /* Get execution time info */
    clGetEventProfilingInfo(ev_mt_end, CL_PROFILING_COMMAND_QUEUED, sizeof(cl_ulong), &prof_start, NULL);
    clGetEventProfilingInfo(ev_mt_end, CL_PROFILING_COMMAND_END, sizeof(cl_ulong), &prof_mt_end, NULL);
    clGetEventProfilingInfo(ev_pi_end, CL_PROFILING_COMMAND_END, sizeof(cl_ulong), &prof_pi_end, NULL);
    clGetEventProfilingInfo(ev_copy_end, CL_PROFILING_COMMAND_END, sizeof(cl_ulong), &prof_copy_end, NULL);

    printf(" mt: %f[ms]¥n"
           " pi: %f[ms]¥n"
           " copy: %f[ms]¥n",
           (prof_mt_end - prof_start) / (1000000.0),
           (prof_pi_end - prof_mt_end) / (1000000.0),
           (prof_copy_end - prof_pi_end) / (1000000.0));

    clReleaseEvent(ev_mt_end);
    clReleaseEvent(ev_pi_end);
    clReleaseEvent(ev_copy_end);

    clReleaseMemObject(rand);
    clReleaseMemObject(count);
    clReleaseKernel(kernel_mt);
    clReleaseKernel(kernel_pi);
    clReleaseProgram(program);
    clReleaseCommandQueue(command_queue);
    clReleaseContext(context);
    free(kernel_src_str);
    free(result);
    return 0;
}
```

We will start by looking at the kernel code

> 009: /\* Initialize state using a seed \*/
>
> 010: static void sgenrand\_mt(uint seed, \_\_global const mt\_struct \*mts, uint \*state) {
>
> 011: int i;
>
> 012: for (i=0; i < mts->nn; i++) {
>
> 013: state\[i] = seed;
>
> 014: seed = (1812433253 \* (seed ^ (seed >> 30))) + i + 1;
>
> 015: }
>
> 016: for (i=0; i < mts->nn; i++)
>
> 017: state\[i] &= mts->wmask;
>
> 018: }

The state bit array is being initialized. The above code is actually copied from the original code used for MT.

> 020: /\* Update state \*/
>
> 021: static void update\_state(\_\_global const mt\_struct \*mts, uint \*st) {
>
> 022: int n = mts->nn, m = mts->mm;
>
> 023: uint aa = mts->aaa, x;
>
> 024: uint uuu = mts->umask, lll = mts->lmask;
>
> 025: int k,lim;
>
> 026: lim = n - m;
>
> 027: for (k=0; k < lim; k++) {
>
> 028: x = (st\[k]\&uuu)|(st\[k+1]\&lll);
>
> 029: st\[k] = st\[k+m] ^ (x>>1) ^ (x&1U ? aa : 0U);
>
> 030: }
>
> 031: lim = n - 1;
>
> 032: for (; k < lim; k++) {
>
> 033: x = (st\[k]\&uuu)|(st\[k+1]\&lll);
>
> 034: st\[k] = st\[k+m-n] ^ (x>>1) ^ (x&1U ? aa : 0U);
>
> 035: }
>
> 036: x = (st\[n-1]\&uuu)|(st\[0]\&lll);
>
> 037: st\[n-1] = st\[m-1] ^ (x>>1) ^ (x&1U ? aa : 0U);
>
> 038: }

The above code updates the state bits.

> 040: static inline void gen(\_\_global uint \*out, const \_\_global mt\_struct \*mts, uint \*state, int num\_rand) {
>
> 041: int i, j, n, nn = mts->nn;
>
> 042: n = (num\_rand+(nn-1)) / nn;
>
> 043: for (i=0; i < n; i++) {
>
> 044: int m = nn;
>
> 045: if (i == n-1) m = num\_rand%nn;
>
> 046: update\_state(mts, state);
>
> 047: for (j=0; j < m; j++) {
>
> 048: /\* Generate random numbers \*/
>
> 049: uint x = state\[j];
>
> 050: x ^= x >> mts->shift0;
>
> 051: x ^= (x << mts->shiftB) & mts->maskB;
>
> 052: x ^= (x << mts->shiftC) & mts->maskC;
>
> 053: x ^= x >> mts->shift1;
>
> 054: out\[i\*nn + j] = x;
>
> 055: }
>
> 056: }
>
> 057: }

The code above generates "num\_rand" random numbers. The update\_state() is called to update the state bits, and a random number is generated from the state bits.

> 059: \_\_kernel void genrand(\_\_global uint \*out,\_\_global mt\_struct \*mts,int num\_rand){
>
> 060: int gid = get\_global\_id(0);
>
> 061: uint seed = gid\*3;
>
> 062: uint state\[17];
>
> 063: mts += gid; /\* mts for this item \*/
>
> 064: out += gid \* num\_rand; /\* Output buffer for this item \*/
>
> 065: sgenrand\_mt(0x33ff\*gid, mts, (uint\*)state); /\* Initialize random numbers \*/
>
> 066: gen(out, mts, (uint\*)state, num\_rand); /\* Generate random numbers \*/
>
> 067: }

The above shows the kernel that generates random numbers by calling the above functions. The kernel takes the output address, MT parameters, and the number of random number to generate as arguments. The "mts" and "out" are pointers to the beginning of the spaces allocated to be used by all work-items. The global ID is used to calculate the addresses to be used by this kernel.

> 069: /\* Count the number of points within the circle \*/
>
> 070: \_\_kernel void calc\_pi(\_\_global uint \*out, \_\_global uint \*rand, int num\_rand) {
>
> 071: int gid = get\_global\_id(0);
>
> 072: int count = 0;
>
> 073: int i;
>
> 074:
>
> 075: rand += gid\*num\_rand;
>
> 076:
>
> 077: for (i=0; i < num\_rand; i++) {
>
> 078: float x, y, len;
>
> 079: x = ((float)(rand\[i]>>16))/65535.0f; /\* x coordinate \*/
>
> 080: y = ((float)(rand\[i]&0xffff))/65535.0f; /\* y coordinate \*/
>
> 081: len = (x\*x + y\*y); /\* Distance from the origin \*/
>
> 082:
>
> 083: if (len < 1) { /\* sqrt(len) < 1 = len < 1 \*/
>
> 084: count++;
>
> 085: }
>
> 086: }
>
> 087:
>
> 088: out\[gid] = count;
>
> 089: }

The above code counts the number of times the randomly chosen point within the square is inside the section of the circle. Since a 32-bit random number is generated, the upper 16 bits are used for the x coordinate, and the lower 16 bits are used for the y coordinate. If the distance from the origin is less than 1, then the chosen point is inside the circle.

Next we will take a look at the host code.

> 014: mt\_struct mts\[] = { /\* Parameters generated by the Dynamic Creater \*/
>
> 015: {-822663744,8,17,23,32,-1,-8388608,8388607,12,18,7,15,-1514742400,-2785280},
>
> ...
>
> 046: {-746112289,8,17,23,32,-1,-8388608,8388607,12,18,7,15,2000509824,-2785280},};

The above is an array of struct for the MT parameters generated using "dc".

> 075: clGetDeviceIDs(platform\_id, CL\_DEVICE\_TYPE\_DEFAULT, 1, \&device\_id,
>
> 076: \&ret\_num\_devices);
>
> 077: context = clCreateContext( NULL, 1, \&device\_id, NULL, NULL, \&ret);
>
> 078: result = (cl\_uint\*)malloc(sizeof(cl\_uint)\*num\_generator);
>
> 079:
>
> 080: command\_queue = clCreateCommandQueue(context, device\_id, CL\_QUEUE\_PROFILING\_ENABLE, \&ret);
>
> 081: fp = fopen("mt.cl", "r");
>
> 082: kernel\_src\_str = (char\*)malloc(MAX\_SOURCE\_SIZE);
>
> 083: kernel\_code\_size = fread(kernel\_src\_str, 1, MAX\_SOURCE\_SIZE, fp);
>
> 084: fclose(fp);
>
> 085:
>
> 086: /\* Create output buffer \*/
>
> 087: rand = clCreateBuffer(context, CL\_MEM\_READ\_WRITE, sizeof(cl\_uint)\*num\_rand\*num\_generator, NULL, \&ret);
>
> 088: count = clCreateBuffer(context, CL\_MEM\_READ\_WRITE, sizeof(cl\_uint)\*num\_generator, NULL, \&ret);
>
> 089:
>
> 090: /\* Build Program\*/
>
> 091: program = clCreateProgramWithSource(context, 1, (const char \*\*)\&kernel\_src\_str,
>
> 092: (const size\_t \*)\&kernel\_code\_size, \&ret);
>
> 093: clBuildProgram(program, 1, \&device\_id, "", NULL, NULL);
>
> 094: kernel\_mt = clCreateKernel(program, "genrand", \&ret);
>
> 095: kernel\_pi = clCreateKernel(program, "calc\_pi", \&ret);
>
> 096:
>
> 097: /\* Create input parameter \*/
>
> 098: dev\_mts = clCreateBuffer(context, CL\_MEM\_READ\_WRITE, sizeof(mts), NULL, \&ret);
>
> 099: clEnqueueWriteBuffer(command\_queue, dev\_mts, CL\_TRUE, 0, sizeof(mts), mts, 0, NULL, NULL);

The code above transfers the MT parameters generated by "dc" to global memory.

> 101: /\* Set Kernel Arguments \*/
>
> 102: clSetKernelArg(kernel\_mt, 0, sizeof(cl\_mem), (void\*)\&rand); /\* Random numbers (output of genrand) \*/
>
> 103: clSetKernelArg(kernel\_mt, 1, sizeof(cl\_mem), (void\*)\&dev\_mts); /\* MT parameter (input to genrand) \*/
>
> 104: clSetKernelArg(kernel\_mt, 2, sizeof(num\_rand), \&num\_rand); /\* Number of random numbers to generate \*/
>
> 105:
>
> 106: clSetKernelArg(kernel\_pi, 0, sizeof(cl\_mem), (void\*)\&count); /\* Counter for points within circle (output of calc\_pi) \*/
>
> 107: clSetKernelArg(kernel\_pi, 1, sizeof(cl\_mem), (void\*)\&rand); /\* Random numbers (input to calc\_pi) \*/
>
> 108: clSetKernelArg(kernel\_pi, 2, sizeof(num\_rand), \&num\_rand); /\* Number of random numbers used \*/

The code segment above sets the arguments to the kernels "kernel\_mt", which generates random numbers, and "kernel\_pi", which counts the number of points within the circle.

> 110: global\_item\_size\[0] = num\_generator; global\_item\_size\[1] = 1; global\_item\_size\[2] = 1;
>
> 111: local\_item\_size\[0] = num\_generator; local\_item\_size\[1] = 1; local\_item\_size\[2] = 1;
>
> 112:
>
> 113: /\* Create a random number array \*/
>
> 114: clEnqueueNDRangeKernel(command\_queue, kernel\_mt, 1, NULL, global\_item\_size, local\_item\_size, 0, NULL, \&ev\_mt\_end);
>
> 115:
>
> 116: /\* Compute PI \*/
>
> 117: clEnqueueNDRangeKernel(command\_queue, kernel\_pi, 1, NULL, global\_item\_size, local\_item\_size, 0, NULL, \&ev\_pi\_end);

The global item size and the local item size are both set to the number of random numbers. This means that the kernels are executed such that only 1 work-group is created, which performs the processing on one compute unit.

> 122: /\* Average the values of PI \*/
>
> 123: count\_all = 0;
>
> 124: for (i=0; i < num\_generator; i++) {
>
> 125: count\_all += result\[i];
>
> 126: }
>
> 127:
>
> 128: pi = ((double)count\_all)/(num\_rand \* num\_generator) \* 4;
>
> 129: printf("pi = %f¥n", pi);

The value of PI is calculated by tallying up the number of points chosen within the circle by each thread to calculate the proportion of hits. As discussed earlier, the value of PI is this proportion multiplied by 4.

## _Parallelization_

Now we will go through the code in the previous section, and use parallelization where we can. Running the code as is on Core i7-2600 + Tesla C 2050 environment, the execution time using different OpenCL implementations (Intel OpenCL SDK 1.5, NVIDIA OpenCL 4.0) for kernel executions and memory copy are shown below in **Figure 6.3**.

**Table 6.3: Processing Times**

| Platform            | mt (ms)  | pi (ms)  | copy (ms)  |
| ------------------- | -------- | -------- | ---------- |
| Tesla C2050         | 2181.4   | 2562.6   | 0.0        |
| Core i7-2600 (CPU)  | 234.1    | 234.1    | 0.01       |

We will look at how these processing times change by parallelization. Since the time required for the memory transfer operation is negligible compared to the other operations, we will not concentrate on this part.

The code in the previous section performed all the operation on one compute unit. The correspondence of the global work-item and the local work-item to the hardware (at least as of this writing) are summarized in **Table 6.4**.

**Table 6.3: Correspondence of hardware with OpenCL work-item**

| OpenCL  | Global work-item  | Local work-item  |
| ------- | ----------------- | ---------------- |
| NVIDIA  | SM                | CUDA core        |
| AMD     | OS thread         | Fiber or SIMD    |

"OS threads" are threads managed by the operating systems, such as pthreads and Win32 threads.

"Fibers" are lightweight threads capable of performing context switching by saving the register contents. Unlike OS threads, fibers do not execute over multiple cores, but are capable of performing context switching quickly.

"SM (Streaming Multiprocessor)" and "CUDA Core" are unit names specific to NVIDIA GPUs. A CUDA core is the smallest unit capable of performing computations. A group of CUDA cores make up the SM.

**Figure 6.10** shows the basic block diagram.

**Figure 6.10: OpenCL work-item and its hardware correspondences**

![](<../.gitbook/assets/Screen Shot 2022-01-11 at 11.19.05 PM.png>)

Please refer to the "CUDA ™ Programming Guide" contained in the NVIDIA SDK for more details on the NVIDIA processor architecture \[8].

Since the code on the previous section only uses one work-group, parallel execution via OS threads or SM is not performed. This would require multiple work-groups to be created.

We will change the code such that the local work-item size is the number of generated parameters created using "dc" divided by CL\_DEVICE\_MAX\_COMPUTE\_UNITS. The number of work-groups and work-items can be set using the code shown below.

> clGetDeviceInfo(device\_id, CL\_DEVICE\_MAX\_COMPUTE\_UNITS, sizeof(cl\_uint),
>
> \&num\_compute\_unit, NULL);
>
> if (num\_compute\_unit > 32)
>
> num\_compute\_unit = 32;
>
> /\* Number of work items \*/
>
> num\_work\_item = (num\_generator+(num\_compute\_unit-1)) / num\_compute\_unit;
>
> /\* Set work-group and work-item size \*/
>
> global\_item\_size\[0] = num\_work\_item \* num\_compute\_unit; global\_item\_size\[1] = 1; global\_item\_size\[2] = 1;
>
> local\_item\_size\[0] = num\_work\_item; local\_item\_size\[1] = 1; local\_item\_size\[2] = 1;

We have limited the maximum number of work-groups to 32, since we have only defined 32 sets of MT parameters in **List 6.17**, and each work-group requires a MT parameter.

> /\* Set Kernel Arguments \*/
>
> clSetKernelArg(kernel\_mt, 0, sizeof(cl\_mem), (void\*)\&rand); /\* Random numbers（output of genrand） \*/
>
> clSetKernelArg(kernel\_mt, 1, sizeof(cl\_mem), (void\*)\&dev\_mts); /\* MT parameter（input to genrand） \*/
>
> clSetKernelArg(kernel\_mt, 2, sizeof(num\_rand), \&num\_rand); /\* Number of random numbers to generate \*/
>
> clSetKernelArg(kernel\_mt, 3, sizeof(num\_generator), \&num\_generator); /\* Number of MT parameters \*/
>
> clSetKernelArg(kernel\_pi, 0, sizeof(cl\_mem), (void\*)\&count); /\* Counter for points withincircle（output of calc\_pi） \*/
>
> clSetKernelArg(kernel\_pi, 1, sizeof(cl\_mem), (void\*)\&rand); /\* Random numbers（input to calc\_pi） \*/
>
> clSetKernelArg(kernel\_pi, 2, sizeof(num\_rand), \&num\_rand); /\* Random numbers (input to calc\_pi) \*/
>
> clSetKernelArg(kernel\_pi, 3, sizeof(num\_generator), \&num\_generator); /\* Number of MT parameters \*/

On the device side, the number of random numbers to generate is limited by the number of available MT parameters.

> \_\_kernel void genrand(\_\_global uint \*out,\_\_global mt\_struct \*mts,int num\_rand, int
>
> num\_generator){
>
> int gid = get\_global\_id(0);
>
> uint seed = gid\*3;
>
> uint state\[17];
>
> if (gid >= num\_generator) return;
>
> …
>
> }
>
> \_\_kernel void calc\_pi(\_\_global uint \*out, \_\_global uint \*rand, int num\_rand, int
>
> num\_generator) {
>
> int gid = get\_global\_id(0);
>
> int count = 0;
>
> int i;
>
> if (gid >= num\_generator) return;
>
> …
>
> }

The processing times after making the changes are shown below in **Table 6.5**.

**Table 6.5: Processing time after parallelization**

| OpenCL        | mt (ms)  | pi (ms)  |
| ------------- | -------- | -------- |
| Tesla C2050   | 626.4    | 270.0    |
| Core i7-2600  | 59.5     | 71.9     |

Note the processing time using FOXC and AMD are reduced by a factor of 4. This was expected, since it is executed on Core i7-2600, which has 4 cores.

However, the processing time is only reduced by a factor of 4 on NVIDIA's OpenCL, which is not quite the expected speed-up, since there are 14 SM's. As shown in **Figure 6.10**, NVIDIA GPUs can perform parallel execution over multiple work-items. In the code in the previous section, all work items are performed in one compute unit, where parallelism is present over the multiple processing units. The code in this section allows one work-item to be executed on each compute-unit. So the difference is in whether the work-items were executed in parallel over the processing units, or the work-items were executed in parallel over the compute units. Thus, the processing time was not reduced significantly, and this speed up is merely from less chance of register data being stored in another memory during context switching.

To use the GPU effectively, parallel execution should occur in both the compute units and the CUDA cores.

**Table 6.5: Processing times from increasing parallelism**

| # MT parameters  |              | mt (ms)  | pi (ms)  |
| ---------------- | ------------ | -------- | -------- |
| 128              | Tesla C2050  | 243.8    | 265.4    |
| Core i7-2600     | 59.8         | 72.0     |          |
| 256              | Tesla C2050  | 180.8    | 180.5    |
| Core i7-2600     | 58.8         | 72.0     |          |
| 512              | Tesla C2050  | 141.3    | 146.6    |
| Core i7-2600     | 57.9         | 72.0     |          |

Note that the processing time does not change on the CPU, but that it reduces significantly on the GPU.

## _Optimization for NVIDIA GPU_

Looking at **Table 6.6**, execution is slower on the NVIDIA despite increasing the parallelism. We will now look into optimizing the code to be executed on the GPU.

The first thing to look at for efficient execution on the GPU is the memory access. Since Tesla (Fermi-architecture) contains cache hardware, frequently accessed data is written to cached memory. However, it is still faster if the local memory usage is explicitly specified by the programmer.

Looking at the code again, the variables "state" and "mts" accesses the same memory space many times. We will change the code so that these data are written to the local memory.

First, we will change the host-side code so the data to be local memory is passed in as an argument to the kernel.

> /\* Set kernel arguments \*/
>
> clSetKernelArg(kernel\_mt, 0, sizeof(cl\_mem), (void\*)\&rand); /\* Random numbers（output of genrand）\*/
>
> clSetKernelArg(kernel\_mt, 1, sizeof(cl\_mem), (void\*)\&dev\_mts); /\* MT parameter（input to genrand） \*/
>
> clSetKernelArg(kernel\_mt, 2, sizeof(num\_rand), \&num\_rand); /\* Number of random numbers to generate \*/
>
> clSetKernelArg(kernel\_mt, 3, sizeof(num\_generator), \&num\_generator); /\* Number of MT parameters \*/
>
> clSetKernelArg(kernel\_mt, 4, sizeof(cl\_uint)\*17\*num\_work\_item, NULL); /\* Local Memory（state） \*/
>
> clSetKernelArg(kernel\_mt, 5, sizeof(mt\_struct)\*num\_work\_item, NULL); /\* Local Memory（mts） \*/

The kernel will now be changed to use the local memory, by using the \_\_local qualifier.

> /\* Initialize state using a seed \*/
>
> static void sgenrand\_mt(uint seed, \_\_local const mt\_struct \*mts, \_\_local uint \*state) {
>
> /\* … \*/
>
> }
>
> /\* Update State \*/
>
> static void update\_state(\_\_local const mt\_struct \*mts, \_\_local uint \*st) {
>
> /\* … \*/
>
> }
>
> static inline void gen(\_\_global uint \*out, const \_\_local mt\_struct \*mts, \_\_local uint \*state, int num\_rand) {
>
> /\* … \*/
>
> }
>
> \_\_kernel void genrand(\_\_global uint \*out,\_\_global mt\_struct \*mts\_g,int num\_rand, int
>
> num\_generator,
>
> \_\_local uint \*state\_mem, \_\_local mt\_struct \*mts){
>
> int lid = get\_local\_id(0);
>
> int gid = get\_global\_id(0);
>
> \_\_local uint \*state = state\_mem + lid\*17; /\* Store current state in local memory \*/
>
> if (gid >= num\_generator) return;
>
> mts += lid;
>
> /\* Copy MT parameters to local memory \*/
>
> mts->aaa = mts\_g\[gid].aaa;
>
> mts->mm = mts\_g\[gid].mm;
>
> mts->nn = mts\_g\[gid].nn;
>
> mts->rr = mts\_g\[gid].rr;
>
> mts->ww = mts\_g\[gid].ww;
>
> mts->wmask = mts\_g\[gid].wmask;
>
> mts->umask = mts\_g\[gid].umask;
>
> mts->lmask = mts\_g\[gid].lmask;
>
> mts->shift0 = mts\_g\[gid].shift0;
>
> mts->shift1 = mts\_g\[gid].shift1;
>
> mts->shiftB = mts\_g\[gid].shiftB;
>
> mts->shiftC = mts\_g\[gid].shiftC;
>
> mts->maskB = mts\_g\[gid].maskB;
>
> mts->maskC = mts\_g\[gid].maskC;
>
> out += gid \* num\_rand; /\* Output buffer for this item\*/
>
> sgenrand\_mt(0x33ff\*gid, mts, (\_\_local uint\*)state); /\* Initialize random numbers \*/
>
> gen(out, mts, (\_\_local uint\*)state, num\_rand); /\* Generate random numbers \*/
>
> }

The new execution times are shown in **Table 6.7**.

**Table 6.7: Processing times on the Tesla using local memory**

| # MT parameters  | mt (ms)  | pi (ms)  |
| ---------------- | -------- | -------- |
| 128              | 185.0    | 263.0    |
| 256              | 130.1    | 177.4    |
| 512              | 92.1     | 143.4    |

We see a definite increase in speed.

The thing to note about the local memory is that it is rather limited. On NVIDIA GPUs, the local memory size is 16,384 bytes. For our program, each work-item requires the storage of the state, which is 17 x 4 = 68 bytes, as well as the MT parameters, which is 14 x 4 = 56. Therefore, each work-item requires 124 bytes, meaning 16384/124 ≈ 132 work-items can be processed within a work-group. For GPUs that do not have many compute units, it may not be able to process if the number of parameters is increased to 256 or 512, since the number of work-items per work-group will be increased. This would not be a problem for Tesla, since the value of CL\_DEVICE\_MAX\_COMPUT\_UNITS is 30.

We will now further tune our program, which can be broken up into the next 3 processes:

• Updating state

• Tempering

• Computing the value of PI

First, we will tackle the computation of PI. In the original code, each work-item processes a different part of an array. One of the properties of the NVIDIA GPU is that it is capable of accessing a block of continuous memory at once to be processed within a work-group. This is known as a coalesced access. Using this knowledge, we will write the code such that each work-group accesses continuous data on the memory. This change is illustrated in **Figure 6.11**.

**Figure 6.11: Grouping of work-items**

![](<../.gitbook/assets/Screen Shot 2022-01-12 at 9.39.48 PM.png>)

The changes in the code are shown below.

> global\_item\_size\_pi\[0] = num\_compute\_unit \* 128; global\_item\_size\_pi\[1] = 1; global\_item\_size\_pi\[2] = 1;
>
> local\_item\_size\_pi\[0] = 128; local\_item\_size\_pi\[1] = 1; local\_item\_size\_pi\[2] = 1;
>
> /\* Compute PI \*/
>
> ret = clEnqueueNDRangeKernel(command\_queue, kernel\_pi, 1, NULL, global\_item\_size\_pi,
>
> local\_item\_size\_pi, 0, NULL, \&ev\_pi\_end);

The above is the change made on the host-side. The number of work-groups is changed to CL\_DEVICE\_MAX\_COMPUT\_UNITS, and the number of work-items is set to 128.

> /\* Count the number of points within the circle \*/
>
> \_\_kernel void calc\_pi(\_\_global uint \*out, \_\_global uint \*rand, int num\_rand\_per\_compute\_unit,
>
> int num\_compute\_unit, int num\_rand\_all, \_\_local uint \*count\_per\_wi)
>
> {
>
> int gid = get\_group\_id(0);
>
> int lid = get\_local\_id(0);
>
> int count = 0;
>
> int i, end, begin;
>
> /\* Indices to be processed in this work-group \*/
>
> begin = gid \* num\_rand\_per\_compute\_unit;
>
> end = begin + num\_rand\_per\_compute\_unit;
>
> /\* Reduce the end boundary index it is greater than the number of random numbers to generate\*/
>
> if (end > num\_rand\_all)
>
> end = num\_rand\_all;
>
> // Compute the reference address corresponding to the local ID
>
> rand += lid;
>
> /\* Process 128 elements at a time \*/
>
> for (i=begin; i < end-128; i+=128) {
>
> float x, y, len;
>
> x = ((float)(rand\[i]>>16))/65535.0f; /\* x coordinate \*/
>
> y = ((float)(rand\[i]&0xffff))/65535.0f; /\* y coordinate \*/
>
> len = (x\*x + y\*y); /\* Distance from the origin \*/
>
> if (len < 1) { /\* sqrt(len) < 1 = len < 1 \*/
>
> count++;
>
> }
>
> }
>
> /\* Process the remaining elements \*/
>
> if ((i + lid) < end) {
>
> float x, y, len;
>
> x = ((float)(rand\[i]>>16))/65535.0f; /\* x coordinate \*/
>
> y = ((float)(rand\[i]&0xffff))/65535.0f; /\* y coordinate \*/
>
> len = (x\*x + y\*y); /\* Distance from the origin \*/
>
> if (len < 1) { /\* sqrt(len) < 1 = len < 1 \*/
>
> count++;
>
> }
>
> }
>
> count\_per\_wi\[lid] = count;
>
> /\* Sum the counters from each work-item \*/
>
> barrier(CLK\_LOCAL\_MEM\_FENCE); /\* Wait until all work-items are finished \*/
>
> if (lid == 0) {
>
> int count = 0;
>
> for (i=0; i < 128; i++) {
>
> count += count\_per\_wi\[i]; /\* Sum the counters \*/
>
> }
>
> out\[gid] = count;
>
> }
>
> }

The above code shows the changes made on the device side. Note that each work-group processes the input data such that all the work-items within the work-group access continuous address space. The code includes the case when the number of data to process is not a multiple of 128. The processing time using this code is 3.8 ms, which is a 40-fold improvement over the previous code.

Next, we will optimize the tempering algorithm. As stated earlier, this process has a parallel nature. For the parameters in our example program, 9 state update and 17 tempering can be performed in parallel. However, since the processing on each word does not require many instructions, and depending on the cost of synchronization, performance may potentially suffer from parallelization. We had concluded previously that a use of SIMD units would be optimal for this process, to reduce the cost of synchronization.

NVIDIA GPUs performs its processes in "warps". A warp is made up of 32 work-items, and all work-items within a warp are executed synchronously. Taking advantage of this property, some operations can be performed in parallel without the need to synchronize.

We will use one warp to perform the update of the state, as well as the tempering process. This would enable these processes to be performed without increasing the synchronization cost. A new block diagram of the distribution of work-items and work-groups are shown in **Figure 6.12** below.

**Figure 6.12: Distribution of work-items for MT**

![](<../.gitbook/assets/Screen Shot 2022-01-12 at 9.42.16 PM.png>)

Note that this optimization is done by using the property of NVIDIA GPUs, so making this change may not allow for proper operation on other devices.

The changes to the program are shown below.

> /\* Each compute unit process 4 warps \*/
>
> warp\_per\_compute\_unit = 4;
>
> /\* Total number of warps \*/
>
> num\_warp = warp\_per\_compute\_unit \* num\_compute\_unit ;
>
> /\* Number of MT parameters per warp (rounded up) \*/
>
> num\_param\_per\_warp = (num\_generator + (num\_warp-1)) / num\_warp;
>
> /\* Number of work-items per group (warp = 32work items) \*/
>
> num\_work\_item = 32 \* warp\_per\_compute\_unit;
>
> /\* Number of random numbers per group \*/
>
> num\_rand\_per\_compute\_unit = (num\_rand\_all + (num\_compute\_unit-1)) / num\_compute\_unit;
>
> /\* Set Kernel Arguments \*/
>
> clSetKernelArg(kernel\_mt, 0, sizeof(cl\_mem), (void\*)\&rand); /\* Random numbers (output of genrand) \*/
>
> clSetKernelArg(kernel\_mt, 1, sizeof(cl\_mem), (void\*)\&dev\_mts); /\* MT parameter (input to genrand) \*/
>
> clSetKernelArg(kernel\_mt, 2, sizeof(num\_rand\_per\_generator), \&num\_rand\_per\_generator); /\* Number of random numbers to generate for each MT parameter \*/
>
> clSetKernelArg(kernel\_mt, 3, sizeof(num\_generator), \&num\_generator); /\* Number of random numbers to generate \*/
>
> clSetKernelArg(kernel\_mt, 4, sizeof(num\_param\_per\_warp), \&num\_param\_per\_warp); /\* Number of parameters to process per work-group \*/
>
> clSetKernelArg(kernel\_mt, 5, sizeof(cl\_uint)\*17\*num\_work\_item, NULL); /\* Local Memory (state) \*/
>
> clSetKernelArg(kernel\_mt, 6, sizeof(mt\_struct)\*num\_work\_item, NULL); /\* Local Memory (mts) \*/
>
> /\* Set the number of work-groups and work-items per work-group \*/
>
> global\_item\_size\_mt\[0] = num\_work\_item \* num\_compute\_unit; global\_item\_size\_mt\[1] = 1; global\_item\_size\_mt\[2] = 1;
>
> local\_item\_size\_mt\[0] = num\_work\_item; local\_item\_size\_mt\[1] = 1; local\_item\_size\_mt\[2] = 1;

The above shows the changes made on the host-side. The number of random numbers to be generated by each work-group is first computed, and this is sent in as an argument. The number of work-items in each work-group is set to 128, which is 4 warps.

> /\* Update state \*/
>
> void update\_state(\_\_local const mt\_struct \*mts, \_\_local uint \*st, int wlid) {
>
> int n = 17, m = 8;
>
> uint aa = mts->aaa, x;
>
> uint uuu = mts->umask, lll = mts->lmask;
>
> int k,lim;
>
> if (wlid < 9) {
>
> /\* Accessing indices k+1 and k+m would normally have dependency issues,
>
> \* but since the operations within a warp is synchronized, the write to
>
> \* st\[k] by each work-item occurs after read from st\[k+1] and st\[k+m] \*/
>
> k = wlid;
>
> x = (st\[k]\&uuu)|(st\[k+1]\&lll);
>
> st\[k] = st\[k+m] ^ (x>>1) ^ (x&1U ? aa : 0U);
>
> }
>
> if (wlid < 7) {
>
> /\* Same reasoning as above. No problem as long as the read operation
>
> \* for each work-item within a work-group is finished before writing \*/
>
> k = wlid + 9;
>
> x = (st\[k]\&uuu)|(st\[k+1]\&lll);
>
> st\[k] = st\[k+m-n] ^ (x>>1) ^ (x&1U ? aa : 0U);
>
> }
>
> if (wlid == 0) {
>
> x = (st\[n-1]\&uuu)|(st\[0]\&lll);
>
> st\[n-1] = st\[m-1] ^ (x>>1) ^ (x&1U ? aa : 0U);
>
> }
>
> }
>
> static inline void gen(\_\_global uint \*out, const \_\_local mt\_struct \*mts, \_\_local uint
>
> \*state, int num\_rand, int wlid) {
>
> int i, j, n, nn = mts->nn;
>
> n = (num\_rand+(nn-1)) / nn;
>
> for (i=0; i < n; i++) {
>
> int m = nn;
>
> if (i == n-1) m = num\_rand%nn;
>
> update\_state(mts, state, wlid);
>
> if (wlid < m) { /\* tempering performed within 1 warp \*/
>
> int j = wlid;
>
> uint x = state\[j];
>
> x ^= x >> mts->shift0;
>
> x ^= (x << mts->shiftB) & mts->maskB;
>
> x ^= (x << mts->shiftC) & mts->maskC;
>
> x ^= x >> mts->shift1;
>
> out\[i\*nn + j] = x;
>
> }
>
> }
>
> }
>
> \_\_kernel void genrand(\_\_global uint \*out,\_\_global mt\_struct \*mts\_g,int num\_rand, int
>
> num\_generator, uint num\_param\_per\_warp, \_\_local uint \*state\_mem,
>
> \_\_local mt\_struct \*mts){
>
> int warp\_per\_compute\_unit = 4;
>
> int workitem\_per\_warp = 32;
>
> int wid = get\_group\_id(0);
>
> int lid = get\_local\_id(0);
>
> int warp\_id = wid \* warp\_per\_compute\_unit + lid / workitem\_per\_warp;
>
> int generator\_id, end;
>
> int wlid = lid % workitem\_per\_warp; /\* Local ID within the warp \*/
>
> \_\_local uint \*state = state\_mem + warp\_id\*17; /\* Store state in local memory \*/
>
> end = num\_param\_per\_warp\*warp\_id + num\_param\_per\_warp;
>
> if (end > num\_generator)
>
> end = num\_generator;
>
> mts = mts + warp\_id;
>
> /\* Loop for each MT parameter within this work-group \*/
>
> for (generator\_id = num\_param\_per\_warp\*warp\_id;
>
> generator\_id < end;
>
> generator\_id ++)
>
> {
>
> if (wlid == 0) {
>
> /\* Copy MT parameters to local memory \*/
>
> mts->aaa = mts\_g\[generator\_id].aaa;
>
> mts->mm = mts\_g\[generator\_id].mm;
>
> mts->nn = mts\_g\[generator\_id].nn;
>
> mts->rr = mts\_g\[generator\_id].rr;
>
> mts->ww = mts\_g\[generator\_id].ww;
>
> mts->wmask = mts\_g\[generator\_id].wmask;
>
> mts->umask = mts\_g\[generator\_id].umask;
>
> mts->lmask = mts\_g\[generator\_id].lmask;
>
> mts->shift0 = mts\_g\[generator\_id].shift0;
>
> mts->shift1 = mts\_g\[generator\_id].shift1;
>
> mts->shiftB = mts\_g\[generator\_id].shiftB;
>
> mts->shiftC = mts\_g\[generator\_id].shiftC;
>
> mts->maskB = mts\_g\[generator\_id].maskB;
>
> mts->maskC = mts\_g\[generator\_id].maskC;
>
> sgenrand\_mt(0x33ff\*generator\_id, mts, (\_\_local uint\*)state); /\* Initialize random numbers \*/
>
> }
>
> gen(out + generator\_id\*num\_rand, mts, (\_\_local uint\*)state, num\_rand, wlid); /\* Generate random numbers \*/
>
> }
>
> }

The above code shows the changes made on the device-side. It is changed such that one DC parameter is processed on each warp, and parallel processing is performed within the warp, reducing the need for synchronization. The processing times after making these changes are shown in **Table 6.8** below.

**Table 6.8: Processing times after optimization**

| # MT parameters  | mt (ms)  |
| ---------------- | -------- |
| 128              | 47.8     |
| 256              | 42.2     |
| 512              | 42.2     |

Note the processing times are reduced significantly.

The final code for the program with all the changes discussed is shown in **List 6.18** (host) and **List 6.19** (device). Running this code on Tesla, there is a 90-fold improvement since the original program15.

**List 6.18: Host-side optimized for NVIDIA GPU**

```
#include <stdlib.h>
#include <CL/cl.h>
#include <stdio.h>
#include <math.h>

typedef struct mt_struct_s
{
    cl_uint aaa;
    cl_int mm, nn, rr, ww;
    cl_uint wmask, umask, lmask;
    cl_int shift0, shift1, shiftB, shiftC;
    cl_uint maskB, maskC;
} mt_struct;

#include "mts.h"

#define MAX_SOURCE_SIZE (0x100000)

int main(int argc, char **argv)
{
    cl_int num_rand_all = 4096 * 256 * 32; /* The number of random numbers to generate */
    cl_int num_rand_per_compute_unit, num_rand_per_generator;
    int count_all, i;
    cl_uint num_generator;
    unsigned int num_work_item;
    double pi;
    cl_platform_id platform_id = NULL;
    cl_uint ret_num_platforms;
    cl_device_id device_id = NULL;
    cl_uint ret_num_devices;
    cl_context context = NULL;
    cl_command_queue command_queue = NULL;
    cl_program program = NULL;
    cl_kernel kernel_mt = NULL, kernel_pi = NULL;
    size_t kernel_code_size;
    char *kernel_src_str;
    cl_uint *result;
    cl_int ret;
    FILE *fp;
    cl_mem rand, count;

    size_t global_item_size_mt[3], local_item_size_mt[3];
    size_t global_item_size_pi[3], local_item_size_pi[3];

    cl_mem dev_mts;
    cl_event ev_mt_end, ev_pi_end, ev_copy_end;
    cl_ulong prof_start, prof_mt_end, prof_pi_end, prof_copy_end;
    cl_uint num_compute_unit, warp_per_compute_unit, num_warp, num_param_per_warp;
    int mts_size;
    mt_struct *mts = NULL;

    if (argc >= 2)
    {
        int n = atoi(argv[1]);
        if (n == 128)
        {
            mts = mts128;
            mts_size = sizeof(mts128);
            num_generator = 128;
            num_rand_per_generator = num_rand_all / 128;
        }
        if (n == 256)
        {
            mts = mts256;
            mts_size = sizeof(mts256);
            num_generator = 256;
            num_rand_per_generator = num_rand_all / 256;
        }
    }

    if (mts == NULL)
    {
        mts = mts512;
        mts_size = sizeof(mts512);
        num_generator = 512;
        num_rand_per_generator = num_rand_all / 512;
    }

    clGetPlatformIDs(1, &platform_id, &ret_num_platforms);
    clGetDeviceIDs(platform_id, CL_DEVICE_TYPE_DEFAULT, 1, &device_id,
                   &ret_num_devices);
    context = clCreateContext(NULL, 1, &device_id, NULL, NULL, &ret);
    result = (cl_uint *)malloc(sizeof(cl_uint) * num_generator);

    command_queue = clCreateCommandQueue(context, device_id, CL_QUEUE_PROFILING_ENABLE, &ret);

    fp = fopen("mt.cl", "r");
    kernel_src_str = (char *)malloc(MAX_SOURCE_SIZE);
    kernel_code_size = fread(kernel_src_str, 1, MAX_SOURCE_SIZE, fp);
    fclose(fp);

    /* Create output buffer */
    rand = clCreateBuffer(context, CL_MEM_READ_WRITE, sizeof(cl_uint) * num_rand_all, NULL, &ret);
    count = clCreateBuffer(context, CL_MEM_READ_WRITE, sizeof(cl_uint) * num_generator, NULL, &ret);

    /* Build Program*/
    program = clCreateProgramWithSource(context, 1, (const char **)&kernel_src_str,
                                        (const size_t *)&kernel_code_size, &ret);
    clBuildProgram(program, 1, &device_id, "", NULL, NULL);

    kernel_mt = clCreateKernel(program, "genrand", &ret);
    kernel_pi = clCreateKernel(program, "calc_pi", &ret);

    /* Create input parameter */
    dev_mts = clCreateBuffer(context, CL_MEM_READ_WRITE, mts_size, NULL, &ret);
    clEnqueueWriteBuffer(command_queue, dev_mts, CL_TRUE, 0, mts_size, mts, 0, NULL, NULL);

    clGetDeviceInfo(device_id, CL_DEVICE_MAX_COMPUTE_UNITS, sizeof(cl_uint), &num_compute_unit, NULL);

    /* Each compute unit process 4 warps */
    warp_per_compute_unit = 4;
    /* Total number of warps */
    num_warp = warp_per_compute_unit * num_compute_unit;
    /* Number of MT parameters per warp (rounded up) */
    num_param_per_warp = (num_generator + (num_warp - 1)) / num_warp;
    /* Number of work-items per group (warp = 32work items) */
    num_work_item = 32 * warp_per_compute_unit;
    /* Number of random numbers per group */
    num_rand_per_compute_unit = (num_rand_all + (num_compute_unit - 1)) / num_compute_unit;

    /* Set Kernel Arguments */
    clSetKernelArg(kernel_mt, 0, sizeof(cl_mem), (void *)&rand);                           /* Random numbers (output of genrand) */
    clSetKernelArg(kernel_mt, 1, sizeof(cl_mem), (void *)&dev_mts);                        /* MT parameter (input to genrand) */
    clSetKernelArg(kernel_mt, 2, sizeof(num_rand_per_generator), &num_rand_per_generator); /* Number of random numbers to generate for each MT parameter */
    clSetKernelArg(kernel_mt, 3, sizeof(num_generator), &num_generator);                   /* Number of random numbers to generate */
    clSetKernelArg(kernel_mt, 4, sizeof(num_param_per_warp), &num_param_per_warp);         /* Number of parameters to process per work-group */
    clSetKernelArg(kernel_mt, 5, sizeof(cl_uint) * 17 * num_work_item, NULL);              /* Local Memory (state) */
    clSetKernelArg(kernel_mt, 6, sizeof(mt_struct) * num_work_item, NULL);                 /* Local Memory (mts) */

    clSetKernelArg(kernel_pi, 0, sizeof(cl_mem), (void *)&count);                                /* Counter for points within circle (output of calc_pi) */
    clSetKernelArg(kernel_pi, 1, sizeof(cl_mem), (void *)&rand);                                 /* Random numbers (input to calc_pi) */
    clSetKernelArg(kernel_pi, 2, sizeof(num_rand_per_compute_unit), &num_rand_per_compute_unit); /* Number of random numbers to process per work-group */
    clSetKernelArg(kernel_pi, 3, sizeof(num_compute_unit), &num_compute_unit);                   /* Number of MT parameters */
    clSetKernelArg(kernel_pi, 4, sizeof(num_rand_all), &num_rand_all);                           /* Number of random numbers used */
    clSetKernelArg(kernel_pi, 5, sizeof(cl_uint) * 128, NULL);                                   /* Memory used for counter */

    /* Set the number of work-groups and work-items per work-group */
    global_item_size_mt[0] = num_work_item * num_compute_unit;
    global_item_size_mt[1] =
        lobal_item_size_mt[2] = 1;
    local_item_size_mt[0] = num_work_item;
    local_item_size_mt[1] = 1;
    local_item_size_mt[2] = 1;

    /* Create a random number array */
    clEnqueueNDRangeKernel(command_queue, kernel_mt, 1, NULL, global_item_size_mt, local_item_size_mt, 0, NULL, &ev_mt_end);

    global_item_size_pi[0] = num_compute_unit * 128;
    global_item_size_pi[1] = 1;
    global_item_size_pi[2] = 1;
    local_item_size_pi[0] = 128;
    local_item_size_pi[1] = 1;
    local_item_size_pi[2] = 1;

    /* Compute PI */
    clEnqueueNDRangeKernel(command_queue, kernel_pi, 1, NULL, global_item_size_pi, local_item_size_pi, 0, NULL, &ev_pi_end);

    /* Get result */
    clEnqueueReadBuffer(command_queue, count, CL_TRUE, 0, sizeof(cl_uint) * num_generator, result, 0, NULL, &ev_copy_end);

    /* Average the values of PI */
    count_all = 0;
    for (i = 0; i < (int)num_compute_unit; i++)
    {
        count_all += result[i];
    }

    pi = ((double)count_all) / (num_rand_all)*4;
    printf("pi = %.20f¥n", pi);

    /* Get execution time info */
    clGetEventProfilingInfo(ev_mt_end, CL_PROFILING_COMMAND_QUEUED, sizeof(cl_ulong), &prof_start, NULL);
    clGetEventProfilingInfo(ev_mt_end, CL_PROFILING_COMMAND_END, sizeof(cl_ulong),
                            f_mt_end, NULL);
    clGetEventProfilingInfo(ev_pi_end, CL_PROFILING_COMMAND_END, sizeof(cl_ulong), &prof_pi_end, NULL);
    clGetEventProfilingInfo(ev_copy_end, CL_PROFILING_COMMAND_END, sizeof(cl_ulong), &prof_copy_end, NULL);

    printf(" mt: %f[ms]¥n"
           " pi: %f[ms]¥n"
           " copy: %f[ms]¥n",
           (prof_mt_end - prof_start) / (1000000.0),
           (prof_pi_end - prof_mt_end) / (1000000.0),
           (prof_copy_end - prof_pi_end) / (1000000.0));

    clReleaseEvent(ev_mt_end);
    clReleaseEvent(ev_pi_end);
    clReleaseEvent(ev_copy_end);

    clReleaseMemObject(rand);
    clReleaseMemObject(count);
    clReleaseKernel(kernel_mt);
    clReleaseKernel(kernel_pi);
    clReleaseProgram(program);
    clReleaseCommandQueue(command_queue);
    clReleaseContext(context);
    free(kernel_src_str);
    free(result);
    return 0;
}
```

**List 6.19: Device-side optimized for NVIDIA GPU**

```
typedef struct mt_struct_s
{
    uint aaa;
    int mm, nn, rr, ww;
    uint wmask, umask, lmask;
    int shift0, shift1, shiftB, shiftC;
    uint maskB, maskC;
} mt_struct;

/* Initialize state using a seed */
static void sgenrand_mt(uint seed, __local const mt_struct *mts, __local uint *state)
{
    int i;
    for (i = 0; i < mts->nn; i++)
    {
        state[i] = seed;
        seed = (1812433253 * (seed ^ (seed >> 30))) + i + 1;
    }
    for (i = 0; i < mts->nn; i++)
        state[i] &= mts->wmask;
}

/* Update state */
static void update_state(__local const mt_struct *mts, __local uint *st, int wlid)
{
    int n = 17, m = 8;
    uint aa = mts->aaa, x;
    uint uuu = mts->umask, lll = mts->lmask;
    int k, lim;

    if (wlid < 9)
    {
        /* Accessing indices k+1 and k+m would normally have dependency issues, 
 * but since the operations within a warp is synchronized, the write to 
 * st[k] by each work-item occurs after read from st[k+1] and st[k+m] */

        k = wlid;
        x = (st[k] & uuu) | (st[k + 1] & lll);
        st[k] = st[k + m] ^ (x >> 1) ^ (x & 1U ? aa : 0U);
    }
    if (wlid < 7)
    {
        /* Same reasoning as above. No problem as long as the read operation 
 * for each work-item within a work-group is finished before writing */

        k = wlid + 9;
        x = (st[k] & uuu) | (st[k + 1] & lll);
        st[k] = st[k + m - n] ^ (x >> 1) ^ (x & 1U ? aa : 0U);
    }
    if (wlid == 0)
    {
        x = (st[n - 1] & uuu) | (st[0] & lll);
        st[n - 1] = st[m - 1] ^ (x >> 1) ^ (x & 1U ? aa : 0U);
    }
}

static inline void gen(__global uint *out, const __local mt_struct *mts, __local uint *state, int num_rand, int wlid)
{
    int i, j, n, nn = mts->nn;
    n = (num_rand + (nn - 1)) / nn;

    for (i = 0; i < n; i++)
    {
        int m = nn;
        if (i == n - 1)
            m = num_rand % nn;

        update_state(mts, state, wlid);

        if (wlid < m)
        { /* tempering performed within 1 warp */
            int j = wlid;
            uint x = state[j];
            x ^= x >> mts->shift0;
            x ^= (x << mts->shiftB) & mts->maskB;
            x ^= (x << mts->shiftC) & mts->maskC;
            x ^= x >> mts->shift1;
            out[i * nn + j] = x;
        }
    }
}

__kernel void genrand(__global uint *out, __global mt_struct *mts_g, int num_rand, int num_generator,
                      uint num_param_per_warp, __local uint *state_mem, __local mt_struct *mts)
{
    int warp_per_compute_unit = 4;
    int workitem_per_warp = 32;
    int wid = get_group_id(0);
    int lid = get_local_id(0);
    int warp_id = wid * warp_per_compute_unit + lid / workitem_per_warp;
    int generator_id, end;
    int wlid = lid % workitem_per_warp; /* Local ID within the warp */

    __local uint *state = state_mem + warp_id * 17; /* Store state in local memory */

    end = num_param_per_warp * warp_id + num_param_per_warp;

    if (end > num_generator)
        end = num_generator;

    mts = mts + warp_id;

    /* Loop for each MT parameter within this work-group */
    for (generator_id = num_param_per_warp * warp_id;
         generator_id < end;
         generator_id++)
    {
        if (wlid == 0)
        {
            /* Copy MT parameters to local memory */
            mts->aaa = mts_g[generator_id].aaa;
            mts->mm = mts_g[generator_id].mm;
            mts->nn = mts_g[generator_id].nn;
            mts->rr = mts_g[generator_id].rr;
            mts->ww = mts_g[generator_id].ww;
            mts->wmask = mts_g[generator_id].wmask;
            mts->umask = mts_g[generator_id].umask;
            mts->lmask = mts_g[generator_id].lmask;
            mts->shift0 = mts_g[generator_id].shift0;
            mts->shift1 = mts_g[generator_id].shift1;
            mts->shiftB = mts_g[generator_id].shiftB;
            mts->shiftC = mts_g[generator_id].shiftC;
            mts->maskB = mts_g[generator_id].maskB;
            mts->maskC = mts_g[generator_id].maskC;
            sgenrand_mt(0x33ff * generator_id, mts, (__local uint *)state); /* Initialize random numbers */
        }
        gen(out + generator_id * num_rand, mts, (__local uint *)state, num_rand, wlid); /* Generate random numbers */
    }
}

/* Count the number of points within the circle */
__kernel void calc_pi(__global uint *out, __global uint *rand, int num_rand_per_compute_unit,
                      int num_compute_unit, int num_rand_all, __local uint *count_per_wi)
{
    int gid = get_group_id(0);
    int lid = get_local_id(0);

    int count = 0;
    int i, end, begin;

    /* Indices to be processed in this work-group */
    begin = gid * num_rand_per_compute_unit;
    end = begin + num_rand_per_compute_unit;

    /* Reduce the end boundary index it is greater than the number of random numbers to generate*/
    if (end > num_rand_all)
        end = num_rand_all;
    // Compute the reference address corresponding to the local ID
    rand += lid;

    /* Process 128 elements at a time */
    for (i = begin; i < end - 128; i += 128)
    {
        float x, y, len;
        x = ((float)(rand[i] >> 16)) / 65535.0f;    /* x coordinate */
        y = ((float)(rand[i] & 0xffff)) / 65535.0f; /* y coordinate */
        len = (x * x + y * y);                      /* Distance from the origin */

        if (len < 1)
        { /* sqrt(len) < 1 = len < 1 */
            count++;
        }
    }

    /* Process the remaining elements */
    if ((i + lid) < end)
    {
        float x, y, len;
        x = ((float)(rand[i] >> 16)) / 65535.0f;    /* x coordinate */
        y = ((float)(rand[i] & 0xffff)) / 65535.0f; /* y coordinate */
        len = (x * x + y * y);                      /* Distance from the origin*/

        if (len < 1)
        { /* sqrt(len) < 1 = len < 1 */
            count++;
        }
    }

    count_per_wi[lid] = count;

    /* Sum the counters from each work-item */

    barrier(CLK_LOCAL_MEM_FENCE); /* Wait until all work-items are finished */

    if (lid == 0)
    {
        int count = 0;
        for (i = 0; i < 128; i++)
        {
            count += count_per_wi[i]; /* Sum the counters */
        }
        out[gid] = count;
    }
}
```
